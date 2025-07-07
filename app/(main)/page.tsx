"use client"
import React, {useRef} from 'react';
import PageHeading from "@/components/PageHeading";
import {Toast} from "primereact/toast";

const HomePage = () => {
    const  toast = useRef(null);

    return (
        <div className="card">
            <Toast ref={toast}/>
           <PageHeading title={"Home"}/>
        </div>
    );
};

export default HomePage;
