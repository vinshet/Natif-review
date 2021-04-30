from dataiku.customrecipe import (
    get_input_names_for_role,
    get_recipe_config,
    get_output_names_for_role,
)
from modules import retreive_bearer_token, check_response, upload_files
import dataiku
import requests
import time
import os
import logging
import pandas as pd

logger = logging.getLogger(__name__)


# Creates the dataframe from the ocr response
def create_dataframe(ocr_response, doc_name):
    global width, height, text, file_name, entropy, x1_pos, x2_pos, y1_pos, y2_pos, page_count, box_id
    page_no = 0
    for pages in ocr_response["pages"]:
        page_no += 1
        for bboxes in pages["bboxes"]:
            # Add the required columns to the csv file
            file_name.append(doc_name)
            entropy.append(bboxes["text_entropy"])
            width.append(pages["width"])
            height.append(pages["height"])
            text.append(bboxes["text"])
            x1_pos.append(bboxes["x1"])
            y1_pos.append(bboxes["y1"])
            x2_pos.append(bboxes["x2"])
            y2_pos.append(bboxes["y2"])
            page_count.append(page_no)
            box_id.append(bboxes["id"])


# Queries for the OCR of the uploaded document for writing
def write_to_dataset(file_info):
    file_id = file_info["uuid"]
    file_name = os.path.basename(file_info["file_upload"])
    upload_details = requests.get(endpoint + "/documents/" + file_id, headers=headers)
    if check_response(upload_details):
        # Keep polling till the endpoint finishes processing the document
        if upload_details.json()["processing_status"] == "pending":
            time.sleep(2)
            write_to_dataset(file_info)
        elif upload_details.json()["processing_status"] == "success":
            response = requests.get(
                endpoint + "/documents/" + file_id + "/ocr?include_raw_types=false",
                headers=headers,
            )
            ocr_response = response.json()
            create_dataframe(ocr_response, file_name)
            logger.error("Extracted OCR from document {}".format(file_name))
        else:
            logger.error("Error extracting OCR from document {}".format(file_name))


input_folder = get_input_names_for_role("ocr_file_upload")
output_dataset = get_output_names_for_role("ocr_data")
input_handle = dataiku.Folder(input_folder[0])
findataset = dataiku.Dataset(output_dataset[0])
cred = get_recipe_config()["credentials"]
usr = cred["login_credentials"]["user"]
pwd = cred["login_credentials"]["password"]
endpoint = "https://api.natif.ai"
ocr_dataframe = pd.DataFrame()
allowed_filetypes = ["jpg", "jpeg", "tif", "tiff", "png", "pdf", "gif"]
# Global lists that contain the dataset data width,height,text,file_name,entropy,x1_pos,x2_pos,y1_pos,y2_pos,page_count,box_id
width = list()
height = list()
text = list()
file_name = list()
entropy = list()
x1_pos = list()
x2_pos = list()
y1_pos = list()
y2_pos = list()
page_count = list()
box_id = list()
bearer = retreive_bearer_token(endpoint, usr, pwd)
headers = {
    "accept": "application/json",
    "Authorization": bearer,
}
file_info = dict()
input_folder_paths = input_handle.list_paths_in_partition()
for file_path in input_folder_paths:
    # Checks if the file extension is allowed for document upload
    file_type = os.path.basename(file_path).split(".")[1]
    if file_type not in allowed_filetypes:
        logger.error(
            "File type does not match for document {}".format(
                os.path.basename(file_path)
            )
        )
        continue
    fil_upload_details = upload_files(
        file_path, "other", headers, input_handle, endpoint
    )
    resp_chk = check_response(fil_upload_details)
    if resp_chk == "quota_exceeded":
        raise ValueError("You have reached your document quota this month!")
    elif resp_chk:
        upload_details = fil_upload_details.json()
        file_info["uuid"] = upload_details["uuid"]
        file_info["file_upload"] = file_path
        write_to_dataset(file_info)
ocr_dataset = {
    "Document_name": file_name,
    "text": text,
    "page no": page_count,
    "box_id": box_id,
    "x1": x1_pos,
    "y1": y1_pos,
    "x2": x2_pos,
    "y2": y2_pos,
    "entropy": entropy,
    "page_width": width,
    "page_height": height,
}
ocr_dataframe = pd.DataFrame(
    ocr_dataset,
    columns=[
        "Document_name",
        "text",
        "entropy",
        "page no",
        "page_width",
        "page_height",
        "box_id",
        "x1",
        "y1",
        "x2",
        "y2",
    ],
)
if len(ocr_dataframe) > 0:
    findataset.write_with_schema(ocr_dataframe, dropAndCreate=True)
