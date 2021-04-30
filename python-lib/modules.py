import logging
import pandas as pd
import requests
logger = logging.getLogger(__name__)


def retreive_bearer_token(endpoint, usr, pwd):
    headers = {
        "accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {"grant_type": "", "username": usr, "password": pwd}
    response = requests.post(endpoint + "/token", headers=headers, data=data)
    if response.status_code >= 400:
        return ""
    res_json = response.json()
    bearer_token = res_json["access_token"]
    # Bearer token for API usage
    bearer = "Bearer " + bearer_token
    if len(bearer)==0:
        logger.error("Credentials error")
        raise ValueError("Cannot retreive access_token. Please check credentials and try again")
    return bearer


def check_response(response_obj):
    if response_obj.status_code == 200 or response_obj.status_code == 201:
        return True
    elif response_obj.status_code == 402:
        return "quota_exceeded"
    else:
        return False

def upload_files(doc,file_type,headers,input_handle,endpoint):
    with input_handle.get_download_stream(doc) as f:
        upload = {
            "file": (doc, f)
        }  # To include just the filename use os.path.basename(doc)
        response = requests.post(
            endpoint + "/documents/?document_type="+file_type.lower()+"&language=xx",
            headers=headers,
            files=upload,
        )
        return response