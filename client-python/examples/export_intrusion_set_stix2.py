# coding: utf-8

import json
from pycti import OpenCTIApiClient

# Variables
api_url = "https://demo.opencti.io"
api_token = "2b4f29e3-5ea8-4890-8cf5-a76f61f1e2b2"

# OpenCTI initialization
opencti_api_client = OpenCTIApiClient(api_url, api_token)

# Get the intrusion set APT28
intrusion_set = opencti_api_client.intrusion_set.read(
    filters=[{"key": "name", "values": ["APT28"]}]
)

# Create the bundle
bundle = opencti_api_client.stix2.export_entity(
    "intrusion-set", intrusion_set["id"], "full"
)
json_bundle = json.dumps(bundle, indent=4)

# Write the bundle
f = open("APT28_STIX2.json", "w")
f.write(json_bundle)
f.close()
