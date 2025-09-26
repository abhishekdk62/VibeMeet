import apiClient from "./apiClient";

export const signIn=async(data)=>{
    const res=await apiClient.post('/auth/signin',data)
    return res.data
}
export const signUp=async(data)=>{
    const res=await apiClient.post('/auth/signup',data)
    return res.data
}