import pandas as pd
from django.shortcuts import render
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework import generics,status
from . import models, serializers,urls,utils
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate,login
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated

# Create your views here.

@api_view(["GET"])
def test(request):
    ip = str(utils.get_ip_address())
    cont = {}
    for i in range(len(urls.urlpatterns)):
        name = str(urls.urlpatterns[i].name).ljust(20).rjust(21," ")
        cont[name] = "http://"+ip + ":8000/"+urls.urlpatterns[i].pattern._route
    
    cont['Admin Login'.ljust(20).rjust(21," ")] = "http://192.168.87.151:8000/admin/"
    
    return Response({"cont":cont})

class Login(APIView):
    permission_classes = [AllowAny]
    serializer_class = serializers.LoginSerial

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            cont = {}
            if models.HOD.objects.filter(username=username).exists():
                cont['user_type'] = 'HOD'
            elif models.Student.objects.filter(username=username).exists():
                cont['user_type'] = 'Student'
            else:
                cont['user_type'] = 'Admin'
            
            token, created = Token.objects.get_or_create(user=user)
            cont['token'] = token.key
            cont['id'] = user.id
            cont['username'] = user.username
            return Response(cont, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

class HODRegisterView(generics.CreateAPIView):
    serializer_class = serializers.HODSerializer
    permission_classes = [IsAuthenticated]  # Changed to AllowAny to allow posting without authentication

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if models.HOD.objects.filter(username=request.user.username).exists() or models.Student.objects.filter(username=request.user.username).exists():
            return Response({"error": "Only Admins can create a HOD."}, status=status.HTTP_403_FORBIDDEN)

        try:
            department_id = request.data.get('department')
            department = get_object_or_404(models.Department, id=department_id)
            instance = serializer.save(department=department)
            return Response({
                "message": "Head of Department created successfully.",
                "id": instance.id,
                "username": instance.username,
                "department": instance.department.name
            }, status=status.HTTP_201_CREATED)
        except models.Department.DoesNotExist:
            return Response({"error": "Department does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        if not (models.HOD.objects.filter(username=request.user.username).exists() or models.Student.objects.filter(username=request.user.username).exists()):
            hods = models.HOD.objects.all()
            serial = self.get_serializer(hods, many=True)
            return Response(serial.data)
        else:
            return Response("Only Admins Can View This Page", status=status.HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS)

class StudentRegisterView(generics.CreateAPIView):
    queryset = models.Student.objects.all()
    serializer_class = serializers.StudentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if not models.HOD.objects.filter(username=request.user.username).exists():
            return Response({"error": "You are not authorized to create a student."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dep_id = request.data.get('department')
            department = get_object_or_404(models.Department, id=dep_id)
            instance = serializer.save(department=department)
            return Response({
                "message": "Student created successfully.",
                "id": instance.id,
                "username": instance.username,
                "department": instance.department.name
            }, status=status.HTTP_201_CREATED) 
        except models.Department.DoesNotExist:
            return Response({"error": "Program does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getStudents(request):
    if request.method == "GET" and models.HOD.objects.filter(username=request.user.username).exists():
        hod = models.HOD.objects.get(username=request.user.username)
        students = models.Student.objects.all().filter(department=hod.department)
        serializer = serializers.StudentSerializer(students, many=True)
        return Response(serializer.data)
    
    if request.method == "GET" and models.Student.objects.filter(username=request.user.username).exists():
        student = models.Student.objects.get(username=request.user.username)
        serial = serializers.StudentSerializer(student)
        return Response(serial.data)
    

class CourseView(generics.ListCreateAPIView):
    queryset = models.Course.objects.all()
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        if models.HOD.objects.filter(username=request.user.username).exists():
            course = serializers.CourseSerial(data=request.data)
            if course.is_valid():
                course.save(department=request.user.hod.department)
                return Response(course.data, status=status.HTTP_201_CREATED)
            return Response(course.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "You are not authorized to view courses."}, status=status.HTTP_403_FORBIDDEN)
        
    def get(self, request, *args, **kwargs):
        if models.HOD.objects.filter(username=request.user.username).exists():
            courses = models.Course.objects.filter(department=request.user.hod.department)
            return Response(serializers.CourseSerializer(courses, many=True).data)
        return Response({"error": "You are not authorized to view courses."}, status=status.HTTP_403_FORBIDDEN)

@api_view(['GET',"POST"])
@permission_classes([IsAuthenticated])
def selectCourses(request,sem):
    if request.method == "GET" and models.Student.objects.filter(username=request.user.username).exists():
        stud = models.Student.objects.get(username=request.user.username)
        studSerial = serializers.StudentSerializer(stud)
        enrolled_courses = serializers.CourseItemSerial(stud.enrolled_courses,many=True)
        avail_courses = serializers.CourseSerializer(models.Course.objects.filter(department=stud.department).filter(program = stud.program).filter(semester=sem),many=True)
        
        cont = {
            "student":studSerial.data,
            "enroled_courses":enrolled_courses.data,
            "avail_courses": avail_courses.data,
        }
        return Response(cont)
    
    if request.method == "POST" and models.Student.objects.filter(username=request.user.username).exists():
        courselist = request.data['CourseIDs']
        stud = models.Student.objects.get(username=request.user.username)
        studSerial = serializers.StudentSerializer(stud)
        semRep,created = models.SemReport.objects.get_or_create(student=stud,semester=stud.sem)
        errors = []
        
        for courseID in courselist:
            cours = models.Course.objects.get(pk=courseID)
            if not stud.enrolled_courses.filter(course=cours,status="Enrolled",semester=stud.sem).exists():
                coursItem = models.CourseStatus(course=cours,status="Enrolled",semester=stud.sem)
                coursItem.save()
                stud.enrolled_courses.add(coursItem)
                semRep.courses.add(coursItem)
                stud.save()
                semRep.save()
            else:
                errors.append(str(cours.name)+" Already Enrolled")
                
        semserial = serializers.ReportSerial(semRep)
        cont = {
            "report":semserial.data,
            "student":studSerial.data,
            "course-list":courselist,
            "error":errors
        }
        return Response(cont)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUpSemWithStudDetail(request):
    if request.method=="GET":
        student = models.Student.objects.get(username=request.user.username)
        studSerial = serializers.StudentSendSerial(student)
        semRep = models.SemReport.objects.filter(student=student)
        semSerial = serializers.ReportSerial(semRep,many=True)
        cont = {
            "student":studSerial.data,
            "sem":student.sem,
            "department":student.department.name,
            "program":student.program.name,
            "report":semSerial.data,
        }
        return Response(cont)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUpSemWithStudDetailHOD(request,sid):
    if request.method=="GET":
        student = models.Student.objects.get(pk=sid)
        studSerial = serializers.StudentSendSerial(student)
        semRep = models.SemReport.objects.filter(student=student)
        semSerial = serializers.ReportSerial(semRep,many=True)
        cont = {
            "student":studSerial.data,
            "sem":student.sem,
            "department":student.department.name,
            "program":student.program.name,
            "report":semSerial.data,
        }
        return Response(cont)
        
@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def getCourses(request):
    if request.method == "GET" and models.HOD.objects.filter(username=request.user.username).exists():
        hod = models.HOD.objects.get(username=request.user.username)
        courses = models.Course.objects.filter(department=hod.department)
        serial = serializers.CourseSerializer(courses,many=True)
        return Response(serial.data)
    
    if request.method == "GET" and models.Student.objects.filter(username=request.user.username).exists():
        student = models.Student.objects.get(username=request.user.username)
        courses = models.Course.objects.filter(department=student.department,semester=student.sem)
        serial = serializers.CourseSerializer(courses,many=True)
        return Response(serial.data)
    
    if request.method == "POST" and models.Student.objects.filter(username=request.user.username).exists():
        student = models.Student.objects.get(username=request.user.username)
        ids = [x['id'] for x in request.data[0]]
        print(ids)
        for i in ids:
            course = models.Course.objects.get(pk=i)
            student.enrolled_courses.add(course)
        serial = serializers.StudentSerializer(student)
        print(serial.data)
        return Response("HI")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def programs(request):
    if request.method == "GET":
        programs = models.Program.objects.filter(department=request.user.hod.department)
        return Response(serializers.ProgramSerial(programs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adminDashBoard(request):
    if request.method == "GET":
        user = models.HOD.objects.get(username=request.user.username)
        programs = models.Program.objects.filter(department=user.department)
        pserial = serializers.ProgramSerial(programs,many=True)
        department = models.Department.objects.all()
        batch = models.Batch.objects.all()
        aprograms = models.Program.objects.all()
        apserial = serializers.ProgramSerial(aprograms,many=True)
        batchSerial = serializers.BatchSerializer(batch,many=True)
        departSerial = serializers.DepartmentSerializer(department,many=True)
        cont = {
            "programs":pserial.data,
            "allprograms":apserial.data,
            "department": user.department.name,
            "batch":batchSerial.data,
            "availDepart":departSerial.data,
        }
        return Response(cont)



    
class StudentRegisterBulk(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.StudentUploadSerializer
    
    def create(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES['file']

        # Check if the uploaded file is an Excel file
        if not uploaded_file.name.endswith(('.xlsx', '.xls')):
            return Response({"error": "Uploaded file is not an Excel file."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read the Excel file into a DataFrame
            df = pd.read_excel(uploaded_file)
            program = models.Program.objects.get(pk=request.data['program'])
            batch = models.Batch.objects.get(pk=request.data['batch'])
            semester = request.data['sem']
            department = models.Department.objects.get(pk=request.user.hod.department.id)
            
            # Process each record in the DataFrame
            message = {"success": [], "error": []}
            for index, row in df.iterrows():
                itm = row.to_dict()
                data = {
                    "username": itm['Username'],
                    "email": itm["Email"],
                    "department": department.id,
                    "program": program.id,
                    "batch": batch.id,
                    "sem": semester,
                    "first_name": itm["First Name"],
                    "last_name": itm["Last Name"],
                    "enrolled_courses": [],
                    "password": itm["Password"]
                }
                try:
                    studSerial = serializers.StudentSerializer(data=data)
                    if studSerial.is_valid(raise_exception=True):  # Pass raise_exception=True for automatic validation errors
                        print("yes Valid")
                        studSerial.save()
                        message['success'].append({"id": itm["Username"], "message": "Student Created"})
                except IntegrityError as e:  # Catching IntegrityError for unique constraints
                    message['error'].append({"id": itm["Username"], "error": str(e)})
                except Exception as e:  # Catching other exceptions
                    message['error'].append({"id": itm["Username"], "error": str(e)})

            return Response({"message": "File processed successfully.", "details": message}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CourseUploadBluk(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.CourseUploadSerializer
    
    def create(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES['file']

        # Check if the uploaded file is an Excel file
        if not uploaded_file.name.endswith(('.xlsx', '.xls')):
            return Response({"error": "Uploaded file is not an Excel file."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read the Excel file into a DataFrame
            df = pd.read_excel(uploaded_file)
            department = models.Department.objects.get(pk=request.user.hod.department.id)
            
            # Process each record in the DataFrame
            message = {"success": [], "error": []}
            for index, row in df.iterrows():
                itm = row.to_dict()
                data = {
                    "name": itm['Course Name'],
                    "code": itm["Course Code"],
                    "is_optional": itm["Optional"],
                    "courseCredit": itm["Credit"],
                    "semester": itm["Semester"],
                    "department": department.id,
                    "program": itm["Program"]
                }
                try:
                    courseSerial = serializers.CourseSerial(data=data)
                    if courseSerial.is_valid(raise_exception=True):  # Pass raise_exception=True for automatic validation errors
                        print("yes Valid")
                        courseSerial.save()
                        message['success'].append({"id": itm["Course Code"], "message": "Course Created"})
                except IntegrityError as e:  # Catching IntegrityError for unique constraints
                    message['error'].append({"id": itm["Course Code"], "error": str(e)})
                except Exception as e:  # Catching other exceptions
                    message['error'].append({"id": itm["Course Code"], "error": str(e)})

            return Response({"message": "File processed successfully.", "details": message}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    
@api_view(["GET"])
def fake(request):
    studentdata = utils.students
    for data in studentdata:
        serializer = serializers.StudentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)
    return Response("Fake")










from icecream import ic

@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def studDashBoard(request):
    if request.method == "GET":
        cont = {}
        cont['department'] = request.user.student.department.name
        cont['program'] = request.user.student.program.name
        cont['batch'] = str(request.user.student.batch)
        cont['first_name'] = request.user.student.first_name 
        cont['last_name'] = request.user.student.last_name
        cont['username'] = request.user.student.username
        cont['current_sem'] = request.user.student.sem
        cur_report, _ = models.SemReport.objects.get_or_create(student=request.user.student,semester=request.user.student.sem)
        cont['enrolled_courses'] = serializers.CourseItemSerial(cur_report.enrolled_courses,many=True).data
        enrolled_course_ids = cur_report.enrolled_courses.values_list('course_id', flat=True)
        avail_courses = models.Course.objects.filter(
            department=request.user.student.department,
            program=request.user.student.program
        ).exclude(id__in=enrolled_course_ids)
        cont['avail_courses'] = serializers.CourseSerializer(avail_courses, many=True).data
        rep = models.SemReport.objects.filter(student=request.user.student)
        cont['report'] = serializers.ReportSerial(rep,many=True).data
        return Response(cont,status=status.HTTP_200_OK)
    
    if request.method == "POST" and request.data.get('type') == "enroll" and request.data.get("type") != "unenroll":
        ic(request.data)
        courselist = request.data.get('CourseIDs', [])
        cont = {}
        cont['errors'] = []
        cont['message'] = []
        report, created = models.SemReport.objects.get_or_create(student=request.user.student, semester=request.user.student.sem)
        
        if report.is_approved:
            return Response({"error": "Cannot modify an approved report."}, status=status.HTTP_403_FORBIDDEN)
        
        for course_id in courselist:
            try:
                course = models.Course.objects.get(pk=course_id)
                if report.enrolled_courses.filter(course=course).exists():
                    cont['errors'].append(f"{course.name} is already enrolled.")
                else:
                    course_status = models.CourseStatus(course=course, status="Enrolled", semester=request.user.student.sem)
                    course_status.save()
                    report.enrolled_courses.add(course_status)
                    report.save()
                    cont['message'].append(f"{course.name} enrolled successfully.")
            except models.Course.DoesNotExist:
                cont['errors'].append(f"Course with ID {course_id} does not exist.")
            except Exception as e:
                cont['errors'].append(str(e))
        return Response(cont, status=status.HTTP_200_OK if not cont['errors'] and cont['message'] else status.HTTP_206_PARTIAL_CONTENT if cont['errors'] and cont['message'] else status.HTTP_400_BAD_REQUEST)
    
    if request.method == "POST" and request.data.get('type') == "unenroll" and request.data.get("type") != "enroll":
        ic(request.data)
        courselist = request.data.get('CourseIDs', [])
        cont = {}
        cont['errors'] = []
        cont['message'] = []
        report, created = models.SemReport.objects.get_or_create(student=request.user.student, semester=request.user.student.sem)
        
        if report.is_approved:
            return Response({"error": "Cannot modify an approved report."}, status=status.HTTP_403_FORBIDDEN)
        
        for course_id in courselist:
            try:
                course = models.Course.objects.get(pk=course_id)
                course_status = report.enrolled_courses.filter(course=course).first()
                if course_status:
                    course_status.delete()
                    cont['message'].append(f"{course.name} unenrolled successfully.")
                else: cont['errors'].append(f"{course.name} is not enrolled.")
            except models.Course.DoesNotExist: cont['errors'].append(f"Course with ID {course_id} does not exist.")
            except Exception as e: cont['errors'].append(str(e))
        return Response(cont, status=status.HTTP_200_OK if not cont['errors'] and cont['message'] else status.HTTP_206_PARTIAL_CONTENT if cont['errors'] and cont['message'] else status.HTTP_400_BAD_REQUEST)
    else:
        return Response("Invalid Request [post data must have type]", status=status.HTTP_406_NOT_ACCEPTABLE)
    

@api_view(["GET","POST","PUT"])
@permission_classes([IsAuthenticated])
def HodDashBoard(req):
    if req.method == "GET":
        cont = {}
        cont['department'] = req.user.hod.department.name
        cont['username'] = req.user.hod.username
        cont['first_name'] = req.user.hod.first_name
        cont['last_name'] = req.user.hod.last_name
        cont['email'] = req.user.hod.email
        cont['programs'] = serializers.ProgramSerial(req.user.hod.department.get_programs(), many=True).data
        cont['students'] = serializers.StudentSerializer(models.Student.objects.filter(department=req.user.hod.department), many=True).data
        cont['courses'] = serializers.HodCourseSerial(models.Course.objects.filter(department=req.user.hod.department), many=True).data
        cont['batchs'] = serializers.BatchSerializer(models.Batch.objects.all(), many=True).data
        return Response(cont, status=status.HTTP_200_OK)

    if req.method == "POST" and req.data.get("type") == "BulkCourseUpload":
        if 'file' not in req.FILES: return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        xl = req.FILES['file']
        if not xl.name.endswith(('.xlsx', '.xls')): return Response({"error": "Uploaded file is not an Excel file."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if not hasattr(req.user, 'hod') or not getattr(req.user.hod, 'department', None): return Response({"error": "You do not have a valid HOD or department."}, status=status.HTTP_403_FORBIDDEN)
            
            df = pd.read_excel(xl, sheet_name='Sheet1')
            message = {"success": [], "error": []}
            for _, row in df.iterrows():
                itm = row.to_dict()
                batch_obj = models.Batch.objects.get(
                    start_year__year=int(itm["Batch Start Year"]),
                    end_year__year=int(itm["Batch End Year"])
                )
                data = {
                    "name": itm["Subject Name"],
                    "code": itm["Subject Code"],
                    "courseCredit": itm["Course Credit"],
                    "semester": itm["Semester (number)"],
                    "batch": [batch_obj.id],
                    "department": models.Department.objects.get(pk=req.user.hod.department.id).id,
                    "program": models.Program.objects.get(pk=itm["Program"]).id
                }
                try:
                    courseSerial = serializers.BulkUploadCourses(data=data)
                    if courseSerial.is_valid(raise_exception=True):
                        courseSerial.save()
                        message['success'].append(f"{itm['Subject Name']} created successfully.")
                except IntegrityError as e: message['error'].append(f"{itm['Subject Name']} already exists.")
                except Exception as e: message['error'].append(f'{itm["Subject Name"]}: {str(e)}')
            return Response({"message": "File processed successfully.", "details": message}, status=status.HTTP_201_CREATED)
        except Exception as e: return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    
    else: return Response("Invalid Request", status=status.HTTP_400_BAD_REQUEST)