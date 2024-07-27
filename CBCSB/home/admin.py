from django.contrib import admin
from . import models
# Register your models here.

@admin.register(models.Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]

# @admin.register(models.Program)
# class ProgramAdmin(admin.ModelAdmin):
#     list_display = ["name", "department", "duration"]
#     search_fields = ["name", "department__name"]
#     list_filter = ["department"]
    
@admin.register(models.Student)
class StudentAdmin(admin.ModelAdmin):
    search_fields = ["username", "email", "department__name"]
    
@admin.register(models.HOD)
class HODAdmin(admin.ModelAdmin):
    search_fields = ["username", "email", "department__name"]
    
@admin.register(models.Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "is_optional","department",'semester']
