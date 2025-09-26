import apiClient from "./apiClient";

export const createMeeting = async (data) => {
  const res = await apiClient.post('/meetings', data);
  return res.data;
};

export const getMeeting = async (meetingId) => {
  const res = await apiClient.get(`/meetings/${meetingId}`);
  return res.data;
};

export const joinMeeting = async (meetingId) => {
  const res = await apiClient.patch(`/meetings/${meetingId}/join`);
  return res.data;
};

export const leaveMeeting = async (meetingId) => {
  const res = await apiClient.patch(`/meetings/${meetingId}/leave`);
  return res.data;
};
export const getMeetings = async (userId) => {
  const res = await apiClient.get(`/meetings/user/${userId}`);
  return res.data;
};

export const updateMeetingStatus = async (meetingId, status) => {
  const res = await apiClient.patch(`/meetings/${meetingId}/status`, { status });
  return res.data;
};

export const endMeeting = async (meetingId) => {
  const res = await apiClient.patch(`/meetings/${meetingId}/end`);
  return res.data;
};
