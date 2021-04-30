from dataiku.customrecipe import (
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
import shutil
from collections import Counter

logger = logging.getLogger(__name__)


# Clears the output folder
def clear_output_folder():
    path_to_folder = input_handle.get_path()
    list_dir = os.listdir(path_to_folder)
    for filename in list_dir:
        file_path = os.path.join(path_to_folder, filename)
        # If the element is a file
        if os.path.isfile(file_path) or os.path.islink(file_path):
            logger.info("deleting file: {}".format(file_path))
            os.unlink(file_path)
        # In case is a folder
        elif os.path.isdir(file_path):
            logger.info("deleting folder: {}".format(file_path))
            shutil.rmtree(file_path)
    logger.info("Cleared the output folder")


# Writes data to the log file format:<document_type>_log.txt
def write_to_log(log_message):
    global input_folder_paths
    doc_type = upload_type
    existing_messages = ""
    path_to_log = str("/" + doc_type.title() + "/" + doc_type.lower() + "_log.txt")
    if path_to_log in input_folder_paths:
        with input_handle.get_download_stream(path_to_log) as f:
            existing_messages = f.read()
            existing_messages = existing_messages.decode()
            if existing_messages == "No documents processed":
                existing_messages = ""
    with input_handle.get_writer(path_to_log) as w:
        w.write((str(existing_messages) + "\n" + log_message).encode())
    input_folder_paths = input_handle.list_paths_in_partition()


# Populates the lists for the extractions dataset
def append_to_list(category, sub_category, value, doc_type, docu_name, b_id, p_num):
    global l1, l2, l3, doc, document_name, box_id, page_number
    if category != "document_type":
        l1.append(category)
        l2.append(sub_category)
        l3.append(value)
        doc.append(doc_type)
        document_name.append(docu_name)
        if isinstance(b_id, list) and isinstance(p_num, list):
            if len(b_id) == 0 and len(p_num) == 0:
                box_id.append("None")
                page_number.append("None")
            else:
                box_id.append(",".join(b_id))
                page_number.append(",".join(p_num))
        else:
            box_id.append(b_id)
            page_number.append(p_num)


# Retreives the box id and the page number for the specific extraction
def get_box_details(box_val):
    id = list()
    p_num = list()
    if box_val is not None:
        for b_ref in box_val:
            p_num.append(str(b_ref["page_num"]))
            id.append(str(b_ref["bbox_id"]))
    return id, p_num


# Retreives the category,sub_category and the values for the document
def get_category_values(val, sub_cat=""):
    if val is None and sub_cat != "bbox_refs":
        append_to_list(
            category_name, sub_cat, "None", upload_type, doc_name, "None", "None"
        )
    elif isinstance(val, dict):
        if "value" in val:
            b_id, p_num = get_box_details(val["bbox_refs"])
            append_to_list(
                category_name, sub_cat, val["value"], upload_type, doc_name, b_id, p_num
            )
        else:
            for k, v in val.items():
                get_category_values(v, k)
    elif isinstance(val, list):
        if len(val) == 0:
            append_to_list(
                category_name, sub_cat, "None", upload_type, doc_name, "None", "None"
            )
        for va in val:
            get_category_values(va)
    elif isinstance(val, str):
        if val:
            append_to_list(
                category_name, sub_cat, val, upload_type, doc_name, "None", "None"
            )


def create_dataframe(extractions_response):
    global category_name
    for key, val in extractions_response.items():
        category_name = key
        get_category_values(val)


def write_to_dataset(file_info):
    global doc_name
    file_id = file_info["uuid"]
    file_name = os.path.basename(file_info["file_upload"])
    doc_name = file_name
    upload_details = requests.get(endpoint + "/documents/" + file_id, headers=headers)
    if check_response(upload_details):
        # Keep polling till the endpoint finishes processing the document
        if upload_details.json()["processing_status"] == "pending":
            time.sleep(2)
            write_to_dataset(file_info)
        elif upload_details.json()["processing_status"] == "success":
            response = requests.get(
                endpoint + "/documents/" + file_id + "/extractions",
                headers=headers,
            )
            extraction_response = response.json()
            create_dataframe(extraction_response)
            write_to_log("Extracted extractions from document {}".format(file_name))
        else:
            write_to_log(
                "Error retreiving extractions from document {}".format(file_name)
            )


# Verifies if the document is placed in the appropriate document structure
def check_structure():
    doc_types = ["invoice", "delivery_note", "order_confirmation"]
    folder_paths = input_handle.list_paths_in_partition()
    for paths in folder_paths:
        doc_type = str(paths.split("/")[1]).lower()
        if doc_type in doc_types:
            return True
        else:
            return False


# For multiple duplicate rows, renames specific cells of the row to make it unique across a document
def rename_duplicates():
    global l1, l2, document_name, doc
    mylist = list()
    for i in range(0, len(document_name)):
        cat_subcat = None
        if l2[i] == "":
            cat_subcat = str(l1[i])
        else:
            cat_subcat = str(l1[i]) + "/" + str(l2[i])
        tmp = str(document_name[i]) + "/" + str(doc[i]) + "/" + cat_subcat
        mylist.append(tmp)
    counts = {k: v for k, v in Counter(mylist).items() if v > 1}
    for i in reversed(range(len(mylist))):
        item = mylist[i]
        if item in counts and counts[item]:
            mylist[i] += "-" + str(counts[item])
            counts[item] -= 1
    for i in range(0, len(mylist)):
        tmp = mylist[i].split("/")
        l1[i] = tmp[2]
        if len(tmp) == 4:
            l2[i] = tmp[3]
        else:
            l2[i] = "None"


def create_default_files(doc_type):
    with input_handle.get_writer(
        str("/" + doc_type.title() + "/" + doc_type.lower() + "_log.txt")
    ) as w:
        w.write("No documents processed".encode())


input_folder = get_output_names_for_role("extractions_folder_structure")
output_dataset = get_output_names_for_role("extractions_data")
input_handle = dataiku.Folder(input_folder[0])
findataset = dataiku.Dataset(output_dataset[0])
folder_structure = get_recipe_config()["fold_structure"]
document_processing = get_recipe_config()["document_processing"]
invoice = get_recipe_config()["invoice"]
order_confirmation = get_recipe_config()["order_confirmation"]
delivery_note = get_recipe_config()["delivery_note"]
log_files = ["invoice_log.txt", "order_confirmation_log.txt", "delivery_note_log.txt"]
cred = None
usr = str()
pwd = str()
endpoint = "https://api.natif.ai"
allowed_filetypes = ["jpg", "jpeg", "tif", "tiff", "png", "pdf", "gif"]
# Global lists that contain the dataset data l1,l2,l3,doc,document_name,box_id,page_number
l1 = list()
l2 = list()
l3 = list()
doc = list()
document_name = list()
box_id = list()
page_number = list()
category_name = None
doc_name = None
upload_type = None
bearer = None
if folder_structure:
    clear_output_folder()
    if invoice:
        create_default_files("Invoice")
    if order_confirmation:
        create_default_files("Order_confirmation")
    if delivery_note:
        create_default_files("Delivery_note")
if document_processing:
    cred = get_recipe_config()["credentials"]
    usr = cred["login_credentials"]["user"]
    pwd = cred["login_credentials"]["password"]
    bearer = retreive_bearer_token(endpoint, usr, pwd)
    if check_structure():
        headers = {
            "accept": "application/json",
            "Authorization": bearer,
        }
        file_info = dict()
        input_folder_paths = input_handle.list_paths_in_partition()
        for file_path in input_folder_paths:
            upload_type = file_path.split("/")[1]
            if str(file_path.split("/")[2]).lower() in log_files:
                continue
            file_type = os.path.basename(file_path).split(".")[1]
            if file_type not in allowed_filetypes:
                write_to_log(
                    "File type not allowed for document {}".format(
                        os.path.basename(file_path)
                    )
                )
                continue
            fil_upload_details = upload_files(
                file_path, upload_type, headers, input_handle, endpoint
            )
            resp_chk = check_response(fil_upload_details)
            if resp_chk == "quota_exceeded":
                raise ValueError("You have reached your document quota this month!")
            elif resp_chk:
                upload_details = fil_upload_details.json()
                file_info["uuid"] = upload_details["uuid"]
                file_info["file_upload"] = file_path
                write_to_dataset(file_info)
    else:
        raise ValueError("Documents are not placed within their appropriate folders")
    rename_duplicates()
    extractions_dataset = {
        "Document_name": document_name,
        "Document_type": doc,
        "category": l1,
        "sub-category": l2,
        "text": l3,
        "page_number": page_number,
        "box_id": box_id,
    }
    df = pd.DataFrame(
        extractions_dataset,
        columns=[
            "Document_name",
            "Document_type",
            "category",
            "sub-category",
            "text",
            "page_number",
            "box_id",
        ],
    )
    df = df.applymap(str)
    if len(df) > 0:
        findataset.write_with_schema(df, dropAndCreate=True)
