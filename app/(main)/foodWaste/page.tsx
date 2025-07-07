"use client"
import React, {useRef} from 'react';
import {Toast} from "primereact/toast";
import PageHeading from "@/components/PageHeading";

const FoodWastePage = () => {
    const toast = useRef(null)
    return (
        <div className="card">
            <Toast ref={toast}/>
            <PageHeading title={"FoodWaste"}/>
        </div>
    );
};

export default FoodWastePage;
