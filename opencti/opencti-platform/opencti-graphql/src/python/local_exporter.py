import json
import logging
import sys

from pycti.api.opencti_api_client import OpenCTIApiClient


class TestLocalExporter:

    def __init__(self, api_url, api_token, entity_id, file_name):
        self.api_url = api_url
        self.api_token = api_token
        self.entity_id = entity_id
        self.file_name = file_name

    def upload(self):
        opencti_api_client = OpenCTIApiClient(self.api_url, self.api_token)
        # Generate a json bundle from openCTI
        bundle = opencti_api_client.stix2.export_entity("malware", self.entity_id, "full")
        json_bundle = json.dumps(bundle, indent=4)
        # Upload the export inside the entity to ack like an import
        opencti_api_client.stix_domain_entity.push_entity_export(self.entity_id, self.file_name, json_bundle)
        # Upload it like a simple file to import
        opencti_api_client.upload_file(file_name=self.file_name, data=json_bundle)


if __name__ == '__main__':
    try:
        api_url = sys.argv[1]
        api_token = sys.argv[2]
        entity_id = sys.argv[3]
        file_name = sys.argv[4]
        testLocalExporter = TestLocalExporter(api_url, api_token, entity_id, file_name)
        testLocalExporter.upload()
    except Exception as e:
        logging.exception(str(e))
        exit(1)
