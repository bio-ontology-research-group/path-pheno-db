from django.contrib import admin

# Register your models here.
from .models import Pheno, Disease
admin.site.register(Pheno)
admin.site.register(Disease)
