import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { AdminStateType } from './AdminStore';

export const useAdminSelector: TypedUseSelectorHook<AdminStateType> = useSelector;
export const useAdminDispatch = () => useDispatch<ThunkDispatch<AdminStateType, void, AnyAction>>();
