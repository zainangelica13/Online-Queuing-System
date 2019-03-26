# Online-Queuing-System

Online queuing system used to control and monitor the flow of queuing line in STI College Lucena

## Getting Started

Online queuing system had a web-based to support the web application. 
This web-based is for the staffs and administrator in STI College Lucena
	
![54516144_407078410051272_340586023194984448_n](https://user-images.githubusercontent.com/37300786/54995247-425b9b80-5001-11e9-92ca-fb5d870af55a.png)

In the login module there are restriction for the users. If the user log in as an admin they will continue for the admin module. For the registrar, proware enrollment staff and cashier has the same module but different account. Users will fill up textboxes for their id number and password, if users attempt to login into the system without filling up the textboxes, they will be alerted to fill up all the textboxes first before they could get into the system. And if they entered a wrong id number or password, they will be informed if the id number exists in the database or if the id number and password does not match. After filling up the textbox and verified their id number and password, they will be directed to the home page of the system where they will have another two options that will direct them to either the queue management module or the queue line module. 

![54517295_384678052363861_6280942637318930432_n](https://user-images.githubusercontent.com/37300786/54995293-60290080-5001-11e9-8232-467a5dc1c8c3.png)

The administrator are the one that needs to add the employee and students to access their account in web application and web-based
Admin home module contains the name of the user level and log out module which can be accessed after the admin have logged in into the system, it is in the home page, queue management page and queue line page. By clicking the log out button, the users log out of the system and will be redirected to login module

![54228754_1030926540427233_3158865407310299136_n (3)](https://user-images.githubusercontent.com/37300786/54995351-8484dd00-5001-11e9-9475-e28732847c7b.png)

The employee list module has a button of update, delete and add new user which is for the employees details to use in logging in to the system. Also it has a logged out button incase if the user wants to logged out the system.

![54278966_2304092509861520_7230807330940518400_n](https://user-images.githubusercontent.com/37300786/54995406-9ebebb00-5001-11e9-808b-6c2cc1f7f930.png)

This module is for editing the details of the current employee and has a two textbox which is for the ID number, name and a dropdown for the designation. It has a two button for the close and the update for the details to save.

![55686807_399323140868008_1450526849472921600_n](https://user-images.githubusercontent.com/37300786/54995594-04ab4280-5002-11e9-8211-6e9207d4a20e.png)

This module is for deleting the employee account and also in the student module it has the same module in deleting the account. 

![53918280_2324067321203942_8558861989672124416_n](https://user-images.githubusercontent.com/37300786/54995487-c9a90f00-5001-11e9-8e55-3b8ba902b1e3.png)

This module has three textboxes which is the ID number, name and the phone number and it has a dropdown for the course. It has two button the close and save button.

![54519361_425881508180938_9177560597120679936_n](https://user-images.githubusercontent.com/37300786/54995638-24426b00-5002-11e9-945e-528606b3ab9a.png)

This module contains the name of the user level and log out module which can be accessed after the user have logged in into the system, it is in the home page, queue management page and queue line page. By clicking the log out button, the users log out of the system and will be redirected to login module.

![54381516_2017144821655800_7240803626803789824_n (1)](https://user-images.githubusercontent.com/37300786/54995706-5522a000-5002-11e9-98a0-24e87526f496.png)

In this module it has the title Queue line and the it has notification text please generate QR code first because the QR code has not been generated. The queue line will not start because of the QR code.

![54798989_275144720067765_8813051606086975488_n](https://user-images.githubusercontent.com/37300786/54995723-62d82580-5002-11e9-8ec1-ae08a22d7cb2.png)

In the queue management module, after the cashier got directed from the home page of the system, the cashier can only generate QR Codes. The cashier has to generate a QR Code first before printing it, because the button for printing the QR Codes are disabled until a QR Code is generated. After the cashier generated a QR Code, only then they can print out a QR Code. And after they have successfully printed a QR Code, they will redirect to the home page of the system where they can now access the queue line module.

![54518999_2193269287560461_4389286856584331264_n](https://user-images.githubusercontent.com/37300786/54995741-6f5c7e00-5002-11e9-972b-9693f083d70b.png)

This module is for printing the QR code using any printer compatible in the computer they are using. Only in the cashier account can generate the QR code. 

![54407662_2834417363451127_1444091618368946176_n](https://user-images.githubusercontent.com/37300786/54995758-8307e480-5002-11e9-9adc-13cd1affecd1.png)

After printing this message will pop up in the website to notify the user that the printing was succeeded.

![54433859_417965249006837_8871236795061239808_n](https://user-images.githubusercontent.com/37300786/54995782-90bd6a00-5002-11e9-8d7c-384794ae4fe6.png)

In the queue line module, after users got directed from the home page of the system, they will have five actions. First action is to start action the queue line, where it starts at number one and ends at number one hundred. Second action is the next action where it advances the queue the one number at a time. Third action is to reserve a queue number, where a queue number can return into the queue line and be served first. Fourth action is to pause the queue line when it is cut-off time before lunch. And the fifth action is the resume action to resume the queue line when lunch is over.

And then this web application is for the students to use it on joining the queue line

![54520838_403825186865788_4274321959438778368_n](https://user-images.githubusercontent.com/37300786/54997612-18a57300-5007-11e9-9064-4e799256072c.png)

This module is for the student to login into the system using their student Id. Their student id was encoded by the assigned admin of the school.

![54520013_2258361511070348_7567779723271471104_n](https://user-images.githubusercontent.com/37300786/54997876-b4cf7a00-5007-11e9-906c-76d161c6f8ef.png)

The verification module has a textbox which the student will write the code what has been in the SMS they have received. It has a button to verify if its correct also it has an attempts error message if the student reach the maximum attempts in verifying the code.

![55564169_422101318559477_9004419728000679936_n](https://user-images.githubusercontent.com/37300786/54997987-0546d780-5008-11e9-966c-60df36948356.png)

The website application has this home module for the students/guests to select what they want to do in the queue line. If the students want to join in the queue line, then they must choose the ‘GET TICKET NUMBER’ button and when they want to get a slot reservation then choose the ‘SLOT RESERVATION’ button. The logout button will automatically sign out their account and go back to the login module.

![54520741_811208409261142_5391508000408076288_n](https://user-images.githubusercontent.com/37300786/54998033-18f23e00-5008-11e9-8a54-3c57b67451a7.png) 

After the students/guests chose the get ticket button, they will choose one of the counter which is the cashier, proware, registrar and the enrollment process that they want to join in the queue line. In the queue line, after they are done they will choose if they want to continue or skip their queue line.

![54257670_618684151910465_7710745758487543808_n](https://user-images.githubusercontent.com/37300786/54998057-27405a00-5008-11e9-9fe5-51987df848bd.png)


This module will show them the line of each counter and they will decide if they want to join or not through the counter and also when the queuing line is full they cannot join in the queue line. In this figure it doesn’t have a number yet because the user did not scan yet the QR code

![55540673_2266225160356249_2308211400209596416_n](https://user-images.githubusercontent.com/37300786/54998083-32938580-5008-11e9-9a80-346c5334fc19.png)

This module will scan the QR code from web-based system to managed the everyday queue line in STI College Lucena and after they finish scanning the QR code the user will be notified that it was successfully scanned. 

![55504339_1201082263385589_5975678360741740544_n](https://user-images.githubusercontent.com/37300786/54998109-40490b00-5008-11e9-9ffd-3584576723d4.png)

This queue line module is the center of the web application, all of the entry from students are from here and save it to the database. The slot reservation is the next line they will go through queuing line.

![54514499_274624050119360_5692110798655062016_n](https://user-images.githubusercontent.com/37300786/54999240-c9f9d800-500a-11e9-96a6-ebb03ce2507b.png)

This message will show the student that his/her queue number is now serving in the counter.

![53865640_268624547392313_2756539856300539904_n](https://user-images.githubusercontent.com/37300786/54999292-dda53e80-500a-11e9-82c2-7ca11377b843.png)

When their queue number is now served, It will show the next button and done button. Next button is called next transaction and can proceed to queue line while done button is directly go home.

![54278326_353825561896320_4160037148889710592_n](https://user-images.githubusercontent.com/37300786/54999307-e8f86a00-500a-11e9-8e4f-94625c1b0a51.png)

This will be shown when the students/guests chose the next button, they will see all the line of queuing of each counter.

![54258183_564793904040318_4755164151184097280_n](https://user-images.githubusercontent.com/37300786/54999356-00375780-500b-11e9-98eb-1e7bdc691a13.png)

Slot reservation are used by the students/guests if they want to have a slot for the queue of the day they scheduled so when they go to the school they have their queue number and join in the queue line. The first textbox is the calendar which you can choose their dates when they want to schedule and the second is select a counter to join in the queue line. This module shows the available slot and the reserved slot. 

## The link of website is here:
https://peaceful-atoll-33285.herokuapp.com
https://radiant-springs-10753.herokuapp.com
