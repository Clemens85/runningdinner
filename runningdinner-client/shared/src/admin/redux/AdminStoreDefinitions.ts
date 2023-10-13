import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {AdminStateType} from "./AdminStore";
import {AnyAction, ThunkDispatch} from "@reduxjs/toolkit";

export const useAdminSelector: TypedUseSelectorHook<AdminStateType> = useSelector;
export const useAdminDispatch = () => useDispatch<ThunkDispatch<AdminStateType, void, AnyAction>>();