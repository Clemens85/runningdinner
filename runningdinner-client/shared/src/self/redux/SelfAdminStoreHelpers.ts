import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { SelfAdminStateType } from './SelfAdminStore';

export const useSelfAdminSelector: TypedUseSelectorHook<SelfAdminStateType> = useSelector;
export const useSelfAdminDispatch = () => useDispatch<ThunkDispatch<SelfAdminStateType, void, AnyAction>>();
