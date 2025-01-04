import React from "react";

const PrintableStudentDetails = ({ student }) => {
  const handlePrint = () => {
    window.print();
  };

  const calculateTotalCredits = (courses) => {
    return courses.reduce(
      (total, enrolled) => total + enrolled.course.courseCredit,
      0
    ); 
  };

  const courses = [
    { name: "Yoga", page: 3, credits: 3 },
    { name: "Physical Fitness", page: 28, credits: 5 },
    { name: "Health and Hygiene", page: 38, credits: 4 },
  ];

  const totalCredits = calculateTotalCredits(
    courses.map((course) => ({ course: { courseCredit: course.credits } }))
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "72rem",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      {/* Print Button */}
      <div
        style={{
          display: "none",
          marginBottom: "1rem",
          print: { display: "block" },
        }}
      >
        <button
          onClick={handlePrint}
          style={{
            backgroundColor: "#16a34a",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.25rem",
            cursor: "pointer",
          }}
        >
          Print Details
        </button>
      </div>

      {/* Header */}
      <div style={{ width: "100%", marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <div style={{ width: "8rem" }}>
            <img
              src="https://admission.kahedu.edu.in/assets/img/logo-ftr.png"
              alt="KAHE Logo"
              style={{ width: "100%" }}
            />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
          >
            <h1
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#16a34a",
                textTransform: "uppercase",
              }}
            >
              Karpagam Academy of Higher Education
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#4b5563", margin: 0 }}>
              (Deemed to be University)
            </p>
            <p style={{ fontSize: "0.875rem", color: "#4b5563", margin: 0 }}>
              (Established Under Section 3 of UGC Act, 1956)
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#4b5563",
                marginTop: "0.5rem",
                marginBottom: "0.25rem",
              }}
            >
              Pollachi Main Road, Eachanari Post, Coimbatore - 641 021, Tamil
              Nadu, India.
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#4b5563",
                marginBottom: "0.25rem",
              }}
            >
              Phone: 0422 - 2980011-14 | Fax: 0422 - 2980022 | Email:
              info@kahedu.edu.in
            </p>
          </div>
          <div style={{ width: "8rem" }}></div>
        </div>
        <div
          style={{
            width: "100%",
            height: "0.25rem",
            backgroundColor: "#16a34a",
          }}
        ></div>
      </div>

      {/* Title Section */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            padding: "1rem",
            border: "1px solid #d1d5db",
          }}
        >
          5.1.3 Capacity development and skills enhancement initiatives
        </h2>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid black",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid black",
                padding: "0.5rem",
                textAlign: "left",
                fontWeight: "600",
                width: "10%",
              }}
            >
              Sl No
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "0.5rem",
                textAlign: "left",
                fontWeight: "600",
              }}
            >
              Capacity development and skills enhancement initiative
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "0.5rem",
                textAlign: "center",
                fontWeight: "600",
                width: "10%",
              }}
            >
              Page No
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "0.5rem",
                textAlign: "center",
                fontWeight: "600",
                width: "10%",
              }}
            >
              Credits
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={index}>
              <td
                style={{
                  border: "1px solid black",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                {index + 1}
              </td>
              <td style={{ border: "1px solid black", padding: "0.5rem" }}>
                {course.name}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                {course.page}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "0.5rem",
                  textAlign: "center",
                }}
              >
                {course.credits}
              </td>
            </tr>
          ))}
          <tr>
            <td
              colSpan="3"
              style={{
                border: "1px solid black",
                padding: "0.5rem",
                textAlign: "right",
                fontWeight: "600",
              }}
            >
              Total Credits
            </td>
            <td
              style={{
                border: "1px solid black",
                padding: "0.5rem",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {totalCredits}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PrintableStudentDetails;