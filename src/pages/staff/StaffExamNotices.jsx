import React from 'react';
import NoticeUpload from '../../components/NoticeUpload';

const StaffExamNotices = ({ userData }) => {
  return <NoticeUpload collectionName="exam_notices" title="Upload Exam Notice" userData={userData} />;
};

export default StaffExamNotices;
