from django.contrib import admin
from . import models
# Register your models here.

@admin.register(models.Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name","id"]
    search_fields = ["name"]

@admin.register(models.Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ["batch","id"]
    
    def batch(self, obj):
        return f"{obj.start_year.year} - {obj.end_year.year}"
    
@admin.register(models.Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ["name", "department", "duration","id"]
    search_fields = ["name", "department__name"]
    list_filter = ["department"]
    
@admin.register(models.Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['username',"first_name","last_name",'department',"batch","sem",'joined_date',]
    list_filter = ['department','sem',"batch"]
    
    search_fields = ["username", "email", "department__name"]
    
    actions =[
        'Set_Semester_1',
        'Set_Semester_2',
        'Set_Semester_3',
        'Set_Semester_4',
        'Set_Semester_5',
        'Set_Semester_6',
        'Set_Semester_7',
        'Set_Semester_8',
        # 'changeBatch',
    ]
    
    def Set_Semester_1(slef,request,queryset):
        queryset.update(sem=1)
    def Set_Semester_2(self,request,queryset):
        queryset.update(sem=2)
    def Set_Semester_3(self,request,queryset):
        queryset.update(sem=3)
    def Set_Semester_4(self,request,queryset):
        queryset.update(sem=4)
    def Set_Semester_5(self,request,queryset):
        queryset.update(sem=5)
    def Set_Semester_6(self,request,queryset):
        queryset.update(sem=6)
    def Set_Semester_7(self,request,queryset):
        queryset.update(sem=7)
    def Set_Semester_8(self,request,queryset):
        queryset.update(sem=8)
    def changeBatch(self,request,queryset):
        queryset.update(batch=5)
    
@admin.register(models.HOD)
class HODAdmin(admin.ModelAdmin):
    list_display = ['username','department']
    search_fields = ["username", "email", "department__name"]
    
@admin.register(models.Course)
class CourseAdmin(admin.ModelAdmin):
    list_filter = ['semester','department','is_optional']
    search_fields = ['name','code']
    list_display = ["name", "code", "program","department",'semester',"id","batchview"]
    
    actions =['Set_Optional',"Set_Compulsory",]

    def batchview(self,obj):
        return ",".join([str(i) for i in obj.batch.all()])
    
    def Set_Optional(self,request,queryset):
        queryset.update(is_optional=True)
    def Set_Compulsory(self,request,queryset):
        queryset.update(is_optional=False)

@admin.register(models.SemReport)
class ReportAdmin(admin.ModelAdmin):
    list_display = [
        'student',
        "semester",
    ]
    
@admin.register(models.CourseStatus)
class CourseItemAdmin(admin.ModelAdmin):
    list_display = [
        "course",
        "status",
        "semester",
        "enrolled_on",
        "is_finished",
        "finished_on"
    ]













admin.site.site_header = "FOE Admin"