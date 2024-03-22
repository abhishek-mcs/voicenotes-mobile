// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import SignInComponent from 'app/auth/login/loginPassword';
// import AppProvider from 'components/AppProvider';
// import { act } from 'react-test-renderer';

// const SignInComp=()=><AppProvider><SignInComponent/></AppProvider>;

// describe('Test SignInComponent', () => {
//   it('renders the component', () => {
//     const { getByText, getByPlaceholderText, getByTestId } = render(<SignInComp />);

//     // Ensure the required elements are present on the screen
//     expect(getByText('Welcome back')).toBeTruthy();
//     expect(getByPlaceholderText("john@doe.com")).toBeTruthy();
//     expect(getByPlaceholderText('Password')).toBeTruthy();
//     expect(getByTestId('signInPasswordBtn')).toBeTruthy();
//   });

//   it('handles user input and interaction', () => {
//     const { getByPlaceholderText, getByTestId } = render(<SignInComp />);

//     // Simulate user input
//     const emailInput = getByPlaceholderText("john@doe.com");
//     const passwordInput = getByPlaceholderText('Password');
//     const continueButton = getByTestId('signInPasswordBtn');
    
//     act(() => {
//       fireEvent.changeText(emailInput, 'kausalin@buymeacoffe.com');
//       fireEvent.changeText(passwordInput, 'Lichin11316');

//       // Click the continue button
//       fireEvent.press(continueButton);
//     })

//   });
// });
