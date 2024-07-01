import React, { useState } from "react";
import {
  Button,
  Modal,
  TextField,
  Tooltip,
  IconButton,
  Typography,
  Backdrop,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const ModalContent = styled("div")(({ theme }) => ({
  position: "absolute",
  width: 400,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  outline: "none",
}));

const InputField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const TooltipContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: theme.spacing(1),
}));

const SignupModal = ({ isOpen, onClose, onSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorTooltip, setErrorTooltip] = useState(false);

  const handleSignup = () => {
    if (email === "") {
      setErrorTooltip(true);
      return;
    }
    if (password === "") {
      setErrorTooltip(true);
      return;
    }

    onSignup(email, password);
  };

  const handleTooltipToggle = () => {
    setErrorTooltip(!errorTooltip);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      BackdropComponent={Backdrop} // Backdrop 설정 추가
      BackdropProps={{
        timeout: 500,
        onClick: onClose, // Backdrop 클릭 시 onClose 호출
      }}
    >
      <ModalContent>
        <Typography variant="h5">회원가입</Typography>
        <InputField
          label="이메일"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          label="비밀번호"
          variant="outlined"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <Button variant="contained" color="primary" onClick={handleSignup}>
            회원가입
          </Button>
        </div>
        <TooltipContainer>
          <Typography>회원가입 관련</Typography>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            onClose={handleTooltipToggle}
            open={errorTooltip}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title={
              <>
                <Typography>* 회원가입이 안될 수 있는 경우 *</Typography>
                <Typography>1. 이미 사용 중인 이메일 주소</Typography>
                <Typography>2. 유효하지 않은 이메일 형식</Typography>
                <Typography>
                  3. 비밀번호는 일반적으로 최소 6자 이상이어야 합니다.
                </Typography>
                <Typography>
                  4. 비밀번호는 숫자, 대문자, 소문자 및 특수 문자를 포함해야 할
                  수 있습니다.
                </Typography>
              </>
            }
            arrow
          >
            <IconButton onClick={handleTooltipToggle}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </TooltipContainer>
      </ModalContent>
    </Modal>
  );
};

SignupModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSignup: PropTypes.func.isRequired,
};

export default SignupModal;
