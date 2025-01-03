from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError


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
    start_year = models.DateField(auto_now=False, auto_now_add=False, )
    end_year = models.DateField(auto_now=False, auto_now_add=False,)
    
    def __str__(self) -> str:
        return f'{self.start_year.year} - {self.end_year.year}'
    
    def get_students(self):
        return self.student_set.all()
    
    def clean(self):
        # Check if a batch with the same start and end years already exists
        if Batch.objects.filter(
            start_year__year=self.start_year.year,
            end_year__year=self.end_year.year
        ).exclude(
            pk=self.pk
        ).exists():
            raise ValidationError(f"A batch with start year {self.start_year.year} and end year {self.end_year.year} already exists.")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def start(self):
        return self.start_year.year
    
    @property
    def end(self):
        return self.end_year.year
    
    @property
    def total_students(self):
        return self.student_set.count()
    

    
    class Meta:
        verbose_name = "Batch"
        verbose_name_plural = "Batches"
        unique_together = ('start_year', 'end_year')
        
class Department(models.Model):
    name = models.CharField(max_length=150)

    def __str__(self):
        if HOD.objects.filter(department=self).exists():
            hod = HOD.objects.get(department=self)
            return f"{self.name} ({hod.username})"
        else:
            return f"{self.name} (No HOD)"
        
    def get_programs(self):
        return self.program_set.all()
    def get_courses(self):
        return self.course_set.all()
    def get_students(self):
        return self.student_set.all()

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
    
    def get_courses(self):
        return self.course_set.all()
    def get_students(self):
        return self.student_set.all()

    class Meta:
        verbose_name = "Program"
        verbose_name_plural = "Programs"

class Course(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=10, unique=True)
    is_optional = models.BooleanField(default=False,verbose_name="Elective ")
    courseCredit = models.IntegerField(default=0)
    semester = models.CharField( 
        max_length=50, 
        choices=year_opt, 
        help_text="Semester the course belongs to"
    )
    batch = models.ManyToManyField(
        Batch, 
        related_name="courses", 
        blank=True, 
        help_text="Batch this course belongs to."
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
    access_to = models.ManyToManyField("home.Student", related_name="Students have access to this course +", blank=True)
    
    def __str__(self) -> str:
        return f'{self.code} | {self.name} | Sem:{self.semester} | {self.program} | {self.batch}'

class CourseStatus(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=50, 
        choices=[
            ("E", "Enrolled"),
            ("P", "Pass"),
            ("F", "Fail"),
        ], 
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

class SemReport(models.Model):
    student = models.ForeignKey("home.Student", on_delete=models.CASCADE)
    semester = models.CharField(
        max_length=50, 
        choices=year_opt, 
        help_text="Semester the Report belongs to"
    )
    enrolled_courses = models.ManyToManyField(CourseStatus, related_name="SemesterReport", blank=True)
    is_approved = models.BooleanField(default=False,help_text="Do the report approved by HOD?")
    reason_for_rejection = models.TextField(blank=True, null=True)
    
    def __str__(self) -> str:
        course_codes = [course.course.code for course in self.enrolled_courses.all()]
        return f'{self.student.username} | Sem: {self.semester} | Courses: {course_codes}'
    
    class Meta:
        verbose_name = "Semester Report"
        verbose_name_plural = "Semester Reports"

class HOD(User):
    department = models.OneToOneField(
        Department,
        verbose_name="Department Belong to this HOD",
        on_delete=models.CASCADE,
    )
    
    def __str__(self) -> str:
        return f'{self.username}'
    
    @property
    def programs(self):
        return self.department.get_programs()

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
    sem = models.CharField(
        max_length=50,
        choices=year_opt,
        help_text="current Semester the student"
    )
    joined_date = models.DateField(auto_now_add=True)
    reports = models.ManyToManyField(
        "home.SemReport",
        blank=True,
        related_name="Student_history",
    )
    
    def __str__(self) -> str:
        return f'{self.username}'
    
    @property
    def enrolled_courses(self):
        current_sem_report = self.semreport_set.filter(semester=self.sem).first()
        if current_sem_report:
            return current_sem_report.enrolled_courses.all()
        return []
    
    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
