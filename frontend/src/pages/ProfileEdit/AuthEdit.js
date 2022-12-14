import { useState, useEffect, useCallback, useRef } from "react";

import styled from "styled-components";
import TextField from "@mui/material/TextField";
import ButtonFooter from "./ButtonFooter";
import Swal from "sweetalert2";
import { imgApi } from "../../shared/imgApi";

const ImgWrapper = styled.div`
  display: flex;
  justify-content: start;
  width: 100%;
`;
const PimgBox = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 70%;
  overflow: hidden;
`;

const Pimg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImgTextBox = styled.div`
  display: flex;
  align-items: end;
`;

const ImgText = styled.p`
  font-size: 16px;
  margin: 5px;
  color: ${(props) => props.color};
  cursor: pointer;
`;

const MenuText = styled.p`
  font-size: 22px;
  width: 200px;
`;

const MenuBox = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  margin: 20px 0;
`;

const AuthEdit = ({ originData }) => {
  const [preview, setPreview] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [birth, setBirth] = useState("");
  const [profile, setProfile] = useState("");
  const inputRef = useRef();

  const fetchState = useCallback(() => {
    setEmail(originData.email);
    setNickname(originData.nickname);
    setBirth(originData.birth_YMD);
    setPreview(originData.picturePath);
  }, [originData]);

  const handleNickname = (e) => {
    setNickname(e.target.value);
  };
  const handleBirth = (e) => {
    setBirth(e.target.value);
  };

  const changeImg = (e) => {
    setProfile(e.target.files[0]);
  };

  const encodeFileToBase64 = (fileBlob) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileBlob);
    return new Promise((resolve) => {
      reader.onload = () => {
        setPreview(reader.result);
        resolve();
      };
    });
  };

  const handleSubmit = () => {
    const datetimeRegexp = /^([0-9]{4}-[0-9]{2}-[0-9]{2})/;
    if (!datetimeRegexp.test(birth)) {
      Swal.fire({ icon: "error", title: "??????????????? ???????????? ??????????????????!" });
      return;
    }

    const data = {
      nickname,
      birth_YMD: birth,
    };

    const formData = new FormData();
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });

    formData.append("data", blob);

    if (profile === "") {
      imgApi
        .putuser(formData)
        .then(() => {
          window.location.reload();
        })
        .catch((err) => {
          if (err.response.status === 409) {
            Swal.fire({ icon: "error", title: "????????? ???????????????!" });
          }
        });
    } else {
      formData.append("profile_image", profile);
      imgApi
        .putuserimage(formData)
        .then(() => {
          window.location.reload();
        })
        .catch((err) => {
          if (err.response.status === 409) {
            Swal.fire({ icon: "error", title: "????????? ???????????????!" });
          }
        });
    }
  };

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return (
    <>
      <ImgWrapper>
        <MenuText>????????? ??????</MenuText>
        <PimgBox>
          <Pimg src={preview} alt="#"></Pimg>
        </PimgBox>
        <input
          id="file"
          type="file"
          name="file"
          style={{ display: "none" }}
          ref={inputRef}
          onChange={(e) => {
            changeImg(e);
            encodeFileToBase64(e.target.files[0]);
          }}
        />
        <ImgTextBox>
          <ImgText color="#42a5f5" onClick={() => inputRef.current.click()}>
            ??????
          </ImgText>
        </ImgTextBox>
      </ImgWrapper>
      <MenuBox>
        <MenuText>email</MenuText>
        <TextField
          disabled
          variant="standard"
          style={{ width: "40%" }}
          value={email || ""}
        />
      </MenuBox>
      <MenuBox>
        <MenuText>?????????</MenuText>
        <TextField
          variant="standard"
          style={{ width: "40%" }}
          value={nickname || ""}
          onChange={handleNickname}
        />
      </MenuBox>
      <MenuBox>
        <MenuText>????????????</MenuText>
        <TextField
          variant="standard"
          style={{ width: "40%" }}
          value={birth || ""}
          onChange={handleBirth}
        />
      </MenuBox>
      <ButtonFooter handleSubmit={handleSubmit} />
    </>
  );
};

export default AuthEdit;
