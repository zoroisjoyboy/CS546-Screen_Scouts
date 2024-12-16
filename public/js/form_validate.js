document.addEventListener('DOMContentLoaded', () => {
  const signUpForm = document.getElementById('signupForm');
  const signInForm = document.getElementById('signinForm');

  if (signUpForm) {
    signUpForm.addEventListener('submit', function (event) {
      if (!validateSignUpForm(event)) {
        event.preventDefault();  
      }
    });
  }

  if (signInForm) {
    signInForm.addEventListener('submit', function (event) {
      if (!validateSignInForm(event)) {
        event.preventDefault(); 
      }
    });
  }

  function validateSignUpForm(event) {
    let isValid = true;
    let errorMessages = [];

    const email = document.getElementById('email');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const userName = document.getElementById('userName');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const birthday = document.getElementById('birthday');
    const profilePic = document.getElementById('profilePic');

    if (!email.value) {
      isValid = false;
      errorMessages.push('Email is required.');
    }
    if (!firstName.value) {
      isValid = false;
      errorMessages.push('First name is required.');
    }
    if (!lastName.value) {
      isValid = false;
      errorMessages.push('Last name is required.');
    }
    if (!userName.value) {
      isValid = false;
      errorMessages.push('Username is required.');
    }
    if (!password.value) {
      isValid = false;
      errorMessages.push('Password is required.');
    }
    if (!confirmPassword.value) {
      isValid = false;
      errorMessages.push('Confirm Password is required.');
    }
    if (!birthday.value) {
      isValid = false;
      errorMessages.push('Birthday is required.');
    }
    if (!profilePic) {
        isValid = false;
        errorMessages.push('Please select a profile picture.');
    }
      
    if (password.value !== confirmPassword.value) {
      isValid = false;
      errorMessages.push('Passwords do not match.');
    }

    displayErrors(errorMessages);

    return isValid;
  }

  function validateSignInForm(event) {
    let isValid = true;
    let errorMessages = [];

    const userName = document.getElementById('userName');
    const password = document.getElementById('password');
    
    if (!userName.value) {
      isValid = false;
      errorMessages.push('Username is required.');
    }
    if (!password.value) {
      isValid = false;
      errorMessages.push('Password is required.');
    }

    displayErrors(errorMessages);

    return isValid;
  }

  function displayErrors(errors) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = '';  

    if (errors.length > 0) {
      errors.forEach((error) => {
        const errorMessage = document.createElement('p');
        errorMessage.classList.add('error');
        errorMessage.textContent = error;
        errorContainer.appendChild(errorMessage);
      });
      errorContainer.style.display = 'block'; 
    } else {
      errorContainer.style.display = 'none'; 
    }
  }
});
