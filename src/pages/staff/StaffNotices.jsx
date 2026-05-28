import React from 'react';
import NoticeUpload from '../../components/NoticeUpload';

const StaffNotices = ({ userData }) => {
  return <NoticeUpload collectionName="notices" title="Upload General Notice" userData={userData} />;
};

export default StaffNotices;
