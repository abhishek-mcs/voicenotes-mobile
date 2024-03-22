// import React from "react";
// import { render, fireEvent } from "@testing-library/react-native";
// import AuthLoginEmail from "app/auth/login";
// import AppProvider from "components/AppProvider";
// import { act } from "react-test-renderer";

// const LoginEmail = () => <AppProvider><AuthLoginEmail/></AppProvider>

// describe("AuthLoginEmail Component", () => {
//   it("renders the component without errors", () => {
//     const { getByText,getByTestId,getByPlaceholderText } = render(<LoginEmail />);

//     // Check if the component renders
//     expect(getByText("Welcome back")).toBeTruthy();
//     expect(getByPlaceholderText('john@doe.com')).toBeTruthy();
//     expect(getByTestId("SignInEmailBtn")).toBeTruthy();

//   });

//   it("handles email validation and button press", () => {
//     const { getByText, getByPlaceholderText } = render(<LoginEmail />);

//     const emailInput = getByPlaceholderText("john@doe.com");
//     const continueButton = getByText("Continue");
//     act(()=>{
//         fireEvent.changeText(emailInput, "kausalin@buymeacoffee.com");
//         fireEvent.press(continueButton);
//     })
//   });

// });
