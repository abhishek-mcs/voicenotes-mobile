// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import LandingPage from 'components/landingPage';
// import AppProvider from 'components/AppProvider';
// import { persistor } from 'redux/store/store';
// import { act } from 'react-test-renderer';

// const mockNavigate = jest.fn();

// jest.mock('expo-router', () => {
//   return {
//     ...jest.requireActual('expo-router'),
//     useRouter: () => ({
//       params: {},
//       push: mockNavigate
//     }),
//     useNavigation: () => ({
//       navigate: mockNavigate,
//     }),
//   };
// });

// describe('initiate test. landing page', () => {
// it('navigates to login page when login button is clicked', () => {
//   const { getByText } = render(
//     <AppProvider>
//       <LandingPage />
//     </AppProvider>
//   );

//   const loginButton = getByText('Log in');
//   act(()=>{
//     fireEvent.press(loginButton);
//   })

//   expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
// });
// })