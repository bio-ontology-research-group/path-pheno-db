from django.db import models

# Create your models here.
class Pheno(models.Model):
    name=models.CharField(max_length=200)
class Disease(models.Model):
    name=models.TextField()
