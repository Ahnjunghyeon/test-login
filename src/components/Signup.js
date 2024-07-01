import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import SignupModal from "./SignupModal";

const Signup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSignup = (email, password) => {
    // 회원가입 로직을 여기에 추가합니다.
    console.log("Signup:", email, password);
    // 성공적으로 회원가입이 되면 모달을 닫습니다.
    handleCloseModal();
  };

  return (
    <div>
      <Typography variant="h4">회원가입 페이지</Typography>
      <Button variant="contained" color="primary" onClick={handleOpenModal}>
        회원가입
      </Button>
      <SignupModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSignup={handleSignup}
      />
    </div>
  );
};

export default Signup;
