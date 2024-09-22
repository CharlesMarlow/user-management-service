## Running this application

* Once cloned, please run `npm install` in order to get this project's dependencies. 
* The project is using the `LowDB` package in order to mimic DB actions. 
  Docs: https://github.com/typicode/lowdb
* From the root directory, please run `npm run dev` in order to start working with the API

# Integration with Twilio/other messaging providers

* Unfortunately, I was unable to integrate with Twilio as a provider phone number wasn't provided
  for the free trial account. The docs contradict this: 
  https://www.twilio.com/docs/messaging/guides/how-to-use-your-free-trial-account

  but this wasn't what appeared as I was setting up things, 3 times from scratch. 
  Other providers required DNS + domain setup and were costly. 

  Instead, I created a Promise mock in order for you to have something to work with. 

  Sorry for this. 

## Handling request through Postman/other HTTP tool

These are some of the endpoints I exposed during development in order to come to a solution. 
Some were used merely for development: 

1. App health: http://localhost:3000/health | `GET`

2. Register user: http://localhost:3000/register | `POST`

- Register user example body:
{
  "name": "Leo Messi",
  "email": "leo@messi.com",
  "mobile": "1234567890",
  "password": "123"
}

3. Get users: http://localhost:3000/users | `GET`

4. Delete user by ID: http://localhost:3000/users/:id | `DELETE`

5. Update user by ID: http://localhost:3000/update/:id | `PUT`

- Update user example body:
{
    "name": "Vini Jr.",
    "email": "vini@jr.com"
}

6. Login user: http://localhost:3000/login | `POST`

- Login user example body:
{
    "email": "leo@messi.com",
    "password": "123"
}

- Note that hear a log would appear with an otp to enter as part of the `verifyLogin` body

When making this request- 

7. Verify login: http://localhost:3000/verify-login | `POST`

- Verify login example body: 
{
    "email": "leo@messi.com",
    "otp": "{otp from console}"
}

8. Change password request: http://localhost:3000/change-password | `POST`

- Change password example body: 
{
    "email": "leo@messi.com"
}

- Similarly to `verifyLogin`, here an otp will appear in the console for using in the `updatePassword` request

9. Update password: http://localhost:3000/update-password | `PUT`

- Update password example body: 
{
    "email": "leo@messi.com",
    "passwordChangeOtp": "{otp from console}"
}

10. Finalise password change: http://localhost:3000/change-password-finalize | `PUT`

- Finalise password change example body: 
{
  "email": "leo@messi.com",
  "newPassword": "1234"
}


## General questions

1. I had to work on the task interminttently but I'd say it took me around 3 days, working a few hours
   every afternoon/evening. As mentioned, I couldn't integrate with Twilio or other providers, which I 
   also spent some time on.

2. Part of the code which is worth mentioning: perhaps I'd go with the `validateOTP` function which had to 
   accept similar values but for different use-cases but I think I managed to keep it readable and concise. 

3. Feedback regarding this challenge: in general, after not having touched node.js in a while it was fun to 
   build an API with Express and this time also include TS, which adds on some trickier parts.

4. Improvements I would introduce, given more time: 

* Validations: 
- email: format
- poassword: run through a standard-strogn password
- mobile: country code + number of digits accordingly

* UI:
- Add a basic UI to accompany the APIs endpoint

* User Update:
- On this endpoint, perhaps the contract between the FE and the BE isn't hermetically sealed. 
  Is the FE completely blocking a mobile update? If so then the BE implementation should 
  work, but if a mobile update is somehow still possible in the FE, the BE should remove
  such an attempt from the resource and when returning also "warn" the FE that an illegal update was attempted
  on the mobile field. 

  In general I don't see why the FE shouldn't block this to begin with, but I thought it might
  be worthwhile to write down this thought here, as some ambiguity arose from this endpoint. 

  * Tests
  - All endpoint should be tested with unit-tests for the way the FE can interact with them, the types
    the BE expects and handles, the responses that are valid and the permitted actions and updates on the user's resource. 
  - Raise a `Message Provider` mock and test for endpoint functionality with regards to communication with SMS. On the 
    login flow it's particulalry crucial, as the login wouldn't be finalised if the SMS flow of sending and verifying
    the otp isn't completed, to generate either a success or error and notify the FE. 

  * Error handling
  - If I could I'd create an `ErrorHandler`, to handle and throw different errors for different use-cases. This would
    also include a type for `HttpErrorCodes`, in order to have something more robust when the API errors, so that each
    status code and error message could be standardised and used across the app in a consistent manner. 

  * Logging
  - Any project could benefit from a proper logging mechanism, either independent or from an external library. For this
    project I added a few console info/error/log statements where I saw necessary but surely this should be handled by
    a true mechanism, which is standardised and consistenly used in any needed place. 

    Thanks for the opportunity of working on this, it was an interesting challenge. 

  