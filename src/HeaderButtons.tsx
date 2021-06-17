import * as React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  HeaderButton as RNavHeaderButton,
  HeaderButtons as RNavHeaderButtons,
} from 'react-navigation-header-buttons';

type HeaderButtonProps = RNavHeaderButton['props'];
const HeaderButton: React.FC<HeaderButtonProps> = props => (
  <RNavHeaderButton
    IconComponent={MaterialCommunityIcons}
    iconSize={23}
    {...props}
  />
);

type HeaderButtonsProps = RNavHeaderButtons['props'];
export const HeaderButtons: React.FC<HeaderButtonsProps> = ({children}) => (
  <RNavHeaderButtons HeaderButtonComponent={HeaderButton}>
    {children}
  </RNavHeaderButtons>
);
