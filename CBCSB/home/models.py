from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User
import math 
from django.utils import timezone


# Create your models here
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


# class Program(models.Model):
#     name = models.CharField(max_length=150)
#     department = models.ForeignKey(
#         Department,
#         verbose_name="Department Belong to this Program",
#         on_delete=models.CASCADE,
#     )
#     duration = models.PositiveSmallIntegerField(
#         help_text="Duration in years",
#         validators=[
#             MinValueValidator(1, message="Duration Must be Grater than 0"),
#             MaxValueValidator(5, message="Duration Must be Less than or equal to 5"),
#         ],
#     )

#     def __str__(self):
#         return f"{self.name} ({self.department.name})"

#     class Meta:
#         verbose_name = "Program"
#         verbose_name_plural = "Programs"
#         unique_together = ("name", "department")


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


# class Course(models.Model):
#     name = models.CharField(max_length=50)
#     code = models.CharField(max_length=10)
#     is_optional = models.BooleanField(default=False)
#     year_opt = (
#         ("1", "First Semester"),
#         ("2", "Second Semester"),
#         ("3", "Third Semester"),
#         ("4", "Fourth Semester"),
#         ("5", "Fifth Semester"),
#         ("6", "Sixth Semester"),
#         ("7", "Seventh Semester"),
#         ("8", "Eighth Semester"),
#         ("9", "Ninth Semester"),
#         ("10", "Tenth Semester"),
#     )
#     semester = models.CharField(
#         max_length=50, choices=year_opt, help_text="Semester the course belongs to"
#     )
#     program = models.ForeignKey(
#         Program,
#         verbose_name="Program Belong to this Course",
#         on_delete=models.CASCADE,
#     )
    
#     def __str__(self) -> str:
#         return f'{self.program} | Sem:{self.semester} | {self.name}'

class Course(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=10)
    is_optional = models.BooleanField(default=False)
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
    semester = models.CharField(
        max_length=50, choices=year_opt, help_text="Semester the course belongs to"
    )
    department = models.ForeignKey(
        Department,
        verbose_name="Department Belong to this Course",
        on_delete=models.CASCADE,
    )
    
    def __str__(self) -> str:
        return f'{self.department} | Sem:{self.semester} | {self.name}'


class Student(User):
    courses = models.ManyToManyField(
        Course,
        related_name="students",
        blank=True,
        help_text="Courses this Student is enrolled in.",
    )
    department = models.ForeignKey(
        Department,
        verbose_name="Department Belong to this Student",
        on_delete=models.CASCADE,
    )
    joined_date = models.DateField(auto_now_add=True)
    
    @property
    def current_semester(self):
        current_date = timezone.now().date()
        months_diff = (current_date.year - self.joined_date.year) * 12 + current_date.month - self.joined_date.month
        semester = math.ceil(months_diff / 6)
        return semester if semester > 0 else 1
    
    def __str__(self) -> str:
        return f'{self.username}'
    
    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"

    
