# coding: utf-8

from pycti import OpenCTIApiClient

# Variables
api_url = "https://demo.opencti.io"
api_token = "2b4f29e3-5ea8-4890-8cf5-a76f61f1e2b2"

# OpenCTI initialization
opencti_api_client = OpenCTIApiClient(api_url, api_token)

# Get the ANSSI entity
anssi = opencti_api_client.stix_domain_entity.get_by_stix_id_or_name(name="ANSSI")

# Print
print(anssi)
