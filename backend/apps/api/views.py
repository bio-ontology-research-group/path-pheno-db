
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
import json
import requests
import itertools
from django.conf import settings
import sys, traceback


ABEROWL_API_URL = getattr(settings, 'ABEROWL_API_URL', 'http://10.254.145.9/')



class SearchClassesAPIView(APIView):

    def get(self, request, format=None):
        query = request.GET.get('query', None)
        try:
            url = ABEROWL_API_URL + '/api/searchclasses'
            params = {'query':query, 'ontology': 'PhenomeNETSH'}
            data = {}
            r = requests.get(url, params=params)
            phenotypes = list()
            for item in r.json()['result']:
                if (item['class'].startswith('http://purl.obolibrary.org/obo/HP_') or
                    item['class'].startswith('http://purl.obolibrary.org/obo/MP_')):
                        phenotypes.append(item)
            data['phenotypes'] = phenotypes


            result = {'status':'ok', 'result':data}
            return Response(result)
        except Exception as e:
            return Response({'status': 'exception', 'message': str(e)})

class ClassesAPIView(APIView):

    def get(self, request, format=None):
        iri = request.GET.get('iri', None)
        try:

            url = ABEROWL_API_URL + '/api/classes'
            params = {'iri':iri, 'ontology': 'DOID'}
            if ("NCBITaxon_" in iri):
                params['ontology']="NCBITAXONSH"
            data = {}
            r = requests.get(url, params=params)

            result = {'status':'ok', 'result':r["result"][iri]}
            return Response(result)

        except Exception as e:
            return Response({'status': 'exception', 'message': str(e)})
