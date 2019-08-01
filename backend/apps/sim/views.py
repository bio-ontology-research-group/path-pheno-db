from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from rest_framework.response import Response
from .models import Pheno
import numpy as np
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, renderer_classes




# Create your views here.

def BMA(sim_mat,order_dict,patient,dis):
	if(len(dis)<1 or len(patient)<1):
		return 0;

	bestScoresP=[]
	for phenoP in patient:
		i=order_dict[phenoP]
		j=order_dict[dis[0].strip()]
		maximum=sim_mat[i][j]
		for phenoD in dis[0:]:
			phenoD=phenoD.strip()
			j=order_dict[phenoD]
			if(sim_mat[i][j]>maximum):
				maximum=sim_mat[i][j]
		bestScoresP.append(maximum)

	bestScoresD=[]
	for phenoD in dis[0:]:
		phenoD=phenoD.strip()
		i=order_dict[phenoD]
		j=order_dict[patient[0]]
		maximum=sim_mat[i][j]
		for phenoP in patient[0:]:
			if(sim_mat[i][j]>maximum):
				maximum=sim_mat[i][j]
		bestScoresD.append(maximum)



	return (np.sum(bestScoresP)/len(bestScoresP)+np.sum(bestScoresD)/len(bestScoresD))/2


def mytest(request):
    return HttpResponse("Hi there!")

def searchView(request):
    all_phenos= Pheno.objects.all()
    return render(request,'search.html', {'all_items': all_phenos})


def addPheno(request,ph_name):
	#ph= Pheno(name=request.POST['name'])
	ph=Pheno(name=ph_name)
	ph.save()
	return HttpResponse("Hi there!")

def deletePheno(request,to_delete_id):
    to_delete=Pheno.objects.get(id=to_delete_id)
    to_delete.delete()
    return HttpResponseRedirect('/search/')


@csrf_exempt
@api_view(('POST',))
def findPatho(request):
	#res_sim = np.loadtxt('data/simscores.txt', dtype = 'float64')
	res_sim=np.load("data/nparray.npy")
	phenotypes = np.genfromtxt('data/HPandMP.txt', dtype = 'str')
	sim_mat = res_sim.reshape(len(phenotypes),len(phenotypes))

	order_dict = dict()
	for i, pheno in enumerate(phenotypes):
		order_dict[pheno]=i

	with open('data/pathoandpheno.txt') as f:
	    lines = f.readlines()
	diseases=[]
	for line in lines:
		diseases.append( line.split('\t') )



	body_unicode = request.body.decode('utf-8')
	patient=json.loads(body_unicode)
	print(patient)
	patientInDict=[]#to get only the phenotypes that we have in our dictionary

	for i in range(len(patient)):
		patient[i]=patient[i].replace(':','_')

	for ph in patient:
		if(ph in order_dict):
			patientInDict.append(ph)


	simScores=[]
	disPhenosInDict=[]
	for dis in diseases:
		for ph in dis:
			if(ph in order_dict):
				disPhenosInDict.append(ph)
		simScores.append(BMA(sim_mat,order_dict,patientInDict,disPhenosInDict))
		disPhenosInDict=[]
	sort_similarity_arg = np.argsort(simScores)[::-1]
	bestMatchDisName=diseases[sort_similarity_arg[0]][0]


	topTenDis=list()
	for i in  range(10):
		print(sort_similarity_arg[i])
		topTenDis.append(diseases[sort_similarity_arg[i]])




	with open('data/dis-patho.txt') as f:
	    lines = f.readlines()

	pathos=[]
	for line in lines:
		dis = line.split('\t')[0]
		if(dis==bestMatchDisName):
			pathos=line.split('\t')
			pathos.pop(0)#to remove doid (first element is dis ID)

	pathos= [elem.strip() for elem in pathos ]
	diseasesAndPathos= dict()
	diseasesAndPathos["diseases"]=bestMatchDisName#topTenDis.slice()
	diseasesAndPathos["pathogenes"]=pathos#pathos.slice()
	diseasesAndPathos["patients"]=patient
	print(diseasesAndPathos)

	return Response(diseasesAndPathos)
