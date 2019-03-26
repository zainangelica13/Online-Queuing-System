# Online-Queuing-System

Online queuing system used to control and monitor the flow of queuing line in STI College Lucena

## Getting Started

Online queuing system had a web-based to support the web application. 
This web-based is for the staffs and administrator in STI College Lucena
	
1

In the login module there are restriction for the users. If the user log in as an admin they will continue for the admin module. For the registrar, proware enrollment staff and cashier has the same module but different account. Users will fill up textboxes for their id number and password, if users attempt to login into the system without filling up the textboxes, they will be alerted to fill up all the textboxes first before they could get into the system. And if they entered a wrong id number or password, they will be informed if the id number exists in the database or if the id number and password does not match. After filling up the textbox and verified their id number and password, they will be directed to the home page of the system where they will have another two options that will direct them to either the queue management module or the queue line module. 

2

The administrator are the one that needs to add the employee and students to access their account in web application and web-based
Admin home module contains the name of the user level and log out module which can be accessed after the admin have logged in into the system, it is in the home page, queue management page and queue line page. By clicking the log out button, the users log out of the system and will be redirected to login module

3

The employee list module has a button of update, delete and add new user which is for the employees details to use in logging in to the system. Also it has a logged out button incase if the user wants to logged out the system.

4

This module is for editing the details of the current employee and has a two textbox which is for the ID number, name and a dropdown for the designation. It has a two button for the close and the update for the details to save.

5

This module has three textboxes which is the ID number, name and the phone number and it has a dropdown for the course. It has two button the close and save button.

6

This module is for deleting the employee account and also in the student module it has the same module in deleting the account. 

7

This module contains the name of the user level and log out module which can be accessed after the user have logged in into the system, it is in the home page, queue management page and queue line page. By clicking the log out button, the users log out of the system and will be redirected to login module.

8

In this module it has the title Queue line and the it has notification text please generate QR code first because the QR code has not been generated. The queue line will not start because of the QR code.

9

In the queue management module, after the cashier got directed from the home page of the system, the cashier can only generate QR Codes. The cashier has to generate a QR Code first before printing it, because the button for printing the QR Codes are disabled until a QR Code is generated. After the cashier generated a QR Code, only then they can print out a QR Code. And after they have successfully printed a QR Code, they will redirect to the home page of the system where they can now access the queue line module.

10

This module is for printing the QR code using any printer compatible in the computer they are using. Only in the cashier account can generate the QR code. 

11

After printing this message will pop up in the website to notify the user that the printing was succeeded.

12

In the queue line module, after users got directed from the home page of the system, they will have five actions. First action is to start action the queue line, where it starts at number one and ends at number one hundred. Second action is the next action where it advances the queue the one number at a time. Third action is to reserve a queue number, where a queue number can return into the queue line and be served first. Fourth action is to pause the queue line when it is cut-off time before lunch. And the fifth action is the resume action to resume the queue line when lunch is over.

And then this web application is for the students to use it on joining the queue line

1

This module is for the student to login into the system using their student Id. Their student id was encoded by the assigned admin of the school.

2

The verification module has a textbox which the student will write the code what has been in the SMS they have received. It has a button to verify if its correct also it has an attempts error message if the student reach the maximum attempts in verifying the code.

3

The website application has this home module for the students/guests to select what they want to do in the queue line. If the students want to join in the queue line, then they must choose the ‘GET TICKET NUMBER’ button and when they want to get a slot reservation then choose the ‘SLOT RESERVATION’ button. The logout button will automatically sign out their account and go back to the login module.

4 

After the students/guests chose the get ticket button, they will choose one of the counter which is the cashier, proware, registrar and the enrollment process that they want to join in the queue line. In the queue line, after they are done they will choose if they want to continue or skip their queue line.

5


This module will show them the line of each counter and they will decide if they want to join or not through the counter and also when the queuing line is full they cannot join in the queue line. In this figure it doesn’t have a number yet because the user did not scan yet the QR code

6

This module will scan the QR code from web-based system to managed the everyday queue line in STI College Lucena and after they finish scanning the QR code the user will be notified that it was successfully scanned. 

7

This queue line module is the center of the web application, all of the entry from students are from here and save it to the database. The slot reservation is the next line they will go through queuing line.

8

Slot reservation are used by the students/guests if they want to have a slot for the queue of the day they scheduled so when they go to the school they have their queue number and join in the queue line. The first textbox is the calendar which you can choose their dates when they want to schedule and the second is select a counter to join in the queue line. This module shows the available slot and the reserved slot. 

## The link of website is here:
https://peaceful-atoll-33285.herokuapp.com
https://radiant-springs-10753.herokuapp.com
