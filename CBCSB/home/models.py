from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User
import math 
from django.utils import timezone


# Create your models here
year_opt = (
        ("1", "First Semester"),
        ("2", "Second Semester"),
        ("3", "Third Semester"),
        ("4", "Fourth Semester"),
        ("5", "Fifth Semester"),
        ("6", "Sixth Semester"),
        ("7", "Seventh Semester"),
        ("8", "Eighth Semester"),
    )

class Batch(models.Model):
    start_year = models.DateField(auto_now=False, auto_now_add=False)
    end_year = models.DateField(auto_now=False, auto_now_add=False)
    
    def __str__(self) -> str:
        return f'{self.start_year.year} - {self.end_year.year}'
    
    class Meta:
        verbose_name = "Batch"
        verbose_name_plural = "Batches"
        
class Department(models.Model):
    name = models.CharField(max_length=150)

    def __str__(self):
        try:
            hod = HOD.objects.get(department=self)
            return f"{self.name} ({hod.username})"
        except HOD.DoesNotExist:
            return self.name
        
    def get_programs(self):
        return self.program_set.all()

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"

class Program(models.Model):
    name = models.CharField(max_length=150)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    duration = models.IntegerField(
        default=4,
        validators=[MinValueValidator(2), MaxValueValidator(5)],
        help_text="Duration of the program in years",
    )

    def __str__(self):
        return f"{self.name} ({self.department.name})"

    class Meta:
        verbose_name = "Program"
        verbose_name_plural = "Programs"

class Course(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=10)
    is_optional = models.BooleanField(default=False)
    courseCredit = models.IntegerField(default=0)
    semester = models.CharField(
        max_length=50, 
        choices=year_opt, 
        help_text="Semester the course belongs to"
    )
    department = models.ForeignKey(
        Department,
        verbose_name="Department Belong to this Course",
        on_delete=models.CASCADE,
    )
    program = models.ForeignKey(
        Program,
        verbose_name="Program Belong to this Course",
        on_delete=models.CASCADE,
    )
    
    def __str__(self) -> str:
        return f'{self.name} | {self.code} | Sem:{self.semester} | {self.program}'

class CourseStatus(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    txt = [
        ("E", "Enrolled"),
        ("P", "Pass"),
        ("F", "Fail"),
    ]
    status = models.CharField(
        max_length=50, 
        choices=txt, 
        help_text="Status of the course"
    )
    semester = models.CharField(
        max_length=50, 
        choices=year_opt, 
        help_text="Semester the course was enrolled by the student"
    )    
    enrolled_on = models.DateField(auto_now_add=True)
    finished_on = models.DateField(null=True,blank=True)
    
    def __str__(self) -> str:
        return f'{self.course.name} | {self.semester}'
    
    def is_finished(self) -> bool:
        if self.finished_on is not None:
            return True
        else:
            return False

    class Meta:
        verbose_name = "Course Item"
        verbose_name_plural = "Course Items"

class HOD(User):
    department = models.OneToOneField(
        Department,
        verbose_name="Department Belong to this HOD",
        on_delete=models.CASCADE,
    )
    
    def __str__(self) -> str:
        return f'{self.username}'

    class Meta:
        verbose_name = "Head of Department"
        verbose_name_plural = "Heads of Department"

class Student(User):
    department = models.ForeignKey(
        Department,
        verbose_name="Department Belong to this Student",
        on_delete=models.CASCADE,
    )
    program = models.ForeignKey(
        Program,
        verbose_name="Program Belong to this Student",
        on_delete=models.CASCADE,
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.PROTECT
    )
    courses = models.ManyToManyField(
        Course,
        related_name="students",
        blank=True,
        help_text="Courses this Student is enrolled in.",
    )
    joined_date = models.DateField(auto_now_add=True)
    sem = models.CharField(
        max_length=50,
        choices=year_opt,
        help_text="Semester the student belongs to"
    )
    enrolled_courses = models.ManyToManyField(CourseStatus, related_name="reports", blank=True)
    
    @property
    def Enrolled(self):
        return " | ".join([f"{str(x.course.name)} ({str(x.course.code)})" for x in self.enrolled_courses.all()]) if self.enrolled_courses.exists() else "None"
    
    def __str__(self) -> str:
        return f'{self.username}'
    
    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
    
class SemReport(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    semester = models.CharField(
        max_length=50, 
        choices=year_opt, 
        help_text="Semester the Report belongs to"
    )  
    courses = models.ManyToManyField(CourseStatus, related_name="SemesterReport", blank=True)
    
    def __str__(self) -> str:
        return f'{self.student.username} | Sem: {self.semester}'
    
    class Meta:
        verbose_name = "Semester Report"
        verbose_name_plural = "Semester Reports"