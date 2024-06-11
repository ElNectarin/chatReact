import React from "react";
import plusPng from "../assets/plus.png";

const CreateButton = () => {
  return (
    <>
      <button>
        <img
          src={plusPng}
          alt="plusPng"
          height={20}
          width={20}
          title="Создать беседу"
        />
      </button>
    </>
  );
};

export { CreateButton };
