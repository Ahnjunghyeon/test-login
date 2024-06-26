import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Logopage.css"; // 스타일 시트 import

const Logopage = () => {
  const [user, setUser] = useState(null); // 로그인 상태를 담는 상태 변수
  const navigate = useNavigate(); // useNavigate hook을 이용하여 페이지 이동을 처리
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // "바로보기" 버튼 클릭 시 처리 함수
  const handleViewClick = () => {
    // 홈 페이지로 이동
    navigate("/home");
  };

  // "글 업로드" 버튼 클릭 시 처리 함수
  const handleUploadClick = () => {
    if (!user) {
      alert("로그인이 필요합니다."); // 로그인이 필요한 경우 경고창 출력 (실제로는 모달 등의 방식으로 변경 가능)
    } else {
      // 로그인이 되어 있으면 글 업로드 페이지로 이동
      navigate("/uploadpage");
    }
  };

  return (
    <div className="logopage-container">
      <div className="logo-container">gdsags</div>
      <div className="intro-text">
        <h1 className="Main">Junghyeon의 SNS</h1>
        <p className="middle"> Welcome^^</p>
      </div>
      <div className="navigation-buttons">
        <Link to="/home" className="button" onClick={handleViewClick}>
          바로보기
        </Link>{" "}
        {/* "바로보기" 버튼 */}
        <Link to="/uploadpage" className="button" onClick={handleUploadClick}>
          글 업로드
        </Link>{" "}
        {/* "글 업로드" 버튼 */}
      </div>
      {!user && ( // user가 없으면 (로그인이 되어 있지 않으면)
        <p style={{ textAlign: "center", marginTop: "20px", color: "red" }}>
          로그인이 필요합니다.
        </p>
      )}
    </div>
  );
};

export default Logopage;
