import { styled, Switch, SwitchProps } from '@mui/material';

const pxToRem = (px: number, oneRemPx = 17) => `${px / oneRemPx}rem`;
const borderWidth = 2;
const width = pxToRem(56);
const height = pxToRem(34);
const size = pxToRem(22);
const gap = (34 - 22) / 2;

export const StyledSwitch = styled((props: SwitchProps) => <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(({ theme }) => ({
  width: width,
  height: height,
  padding: 0,
  margin: theme.spacing(1),
  overflow: 'unset',
  '& .MuiSwitch-switchBase': {
    padding: pxToRem(gap),
    '&.Mui-checked': {
      color: '#fff',
      transform: `translateX(calc(${width} - ${size} - ${pxToRem(2 * gap)}))`,
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 'none',
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: size,
    height: size,
  },
  '& .MuiSwitch-track': {
    borderRadius: 40,
    border: `solid ${theme.palette.grey[400]}`,
    borderWidth,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
    boxSizing: 'border-box',
  },
}));

type CustomSwitchProps = {
  checked?: boolean;
  onChange: (checked: boolean) => unknown;
};
const CustomSwitch = ({ checked, onChange }: CustomSwitchProps) => {
  return (
    <>
      <StyledSwitch checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </>
  );
};
export default CustomSwitch;
