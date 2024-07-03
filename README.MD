# Lunaris: Learning Management System

## Overview

Lunaris is a versatile learning management system designed to streamline and enhance the administrative and academic operations of educational institutions. Developed as a thesis project by Răducu Alexandru Mircea, this system offers a robust platform for managing educational data and processes. Lunaris can be deployed both on the cloud and on local servers, thanks to its Kubernetes (k8s) architecture, providing flexibility to meet various institutional needs.

## Features

- Class Management: Organize and manage class schedules, assignments, and grades.

- Schools/Faculties Management: Handle multiple schools and faculties within the institution.

- Programs Management: Manage different academic programs (Bachelor’s, Master’s).

- Subjects Management: Administer various subjects offered in different programs.

- User Management: Manage profiles and roles for students, professors, and administrators.

- Grades and Scholar Situation Management: Track and manage student grades and academic progress.

- Assignment Hosting: Submit and review assignments online.

- Messaging System: Support for group and direct messaging between users.

- File Management System: Store and manage files related to classes and assignments.

## Technology Stack

- Backend: Microservices architecture using Kubernetes for container management.

- Frontend: Angular for the web application interface.

- Database: MySQL, MongoDB for storing and managing data.

- Cloud Services: Google Cloud for hosting and scalability.

- Security: GDPR compliant, with robust data protection and encryption protocols.

## Installation and Setup

1. Clone all the repositories for microservices.

2. Ensure Kubernetes is installed.

3. Refer to the k8s folder inside the k8s-dev branch.

4. Create all the required volumes (details can be found in pv.yaml under the conf volumes folder).

5. Adjust the paths for the volumes as needed.

6. Apply the Kubernetes configuration:

   ```bash
   kubectl apply -R -f k8s
   ```

## Usage

Lunaris provides an intuitive interface for managing various aspects of educational operations. After setting up the application, users can log in and access different modules based on their roles (Student, Professor, Admin). The dashboard provides a comprehensive view of all ongoing activities, upcoming deadlines, and important notifications.

## Author

Fullname: Răducu Alexandru Mircea  
Email: alexandru@alxraducu.com  
Website: [alxraducu.com](http://alxraducu.com)

## License

This project is licensed under the MIT License.

## Acknowledgments

This project was developed as part of the final year thesis at the Romanian-American University, Faculty of Computer Science for Business Management.
