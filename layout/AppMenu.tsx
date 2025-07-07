import type {MenuModel} from "@/types";
import AppSubMenu from "./AppSubMenu";

const AppMenu = () => {
    const model: MenuModel[] = [
        {
            label: "Dashboards",
            icon: "pi pi-home",
            items: [
                {
                    label: "Home",
                    icon: "pi pi-fw pi-home",
                    to: "/",
                },
                {
                    label: "Food Waste",
                    icon: "pi pi-fw pi-palette",
                    to: "/foodWaste",
                },
                {
                    label: "Employee Award",
                    icon: "pi pi-fw pi-heart-fill",
                    to: "/employeeAward",
                },
            ],
        }
        // {
        //     label: "Apps",
        //     icon: "pi pi-th-large",
        //     items: [
        //         {
        //             label: "Blog",
        //             icon: "pi pi-fw pi-comment",
        //             items: [
        //                 {
        //                     label: "Details",
        //                     icon: "pi pi-fw pi-image",
        //                     // to: "/",
        //                 },
        //             ],
        //         },
        //     ]
        // },


    ];

    return <AppSubMenu model={model}/>;
};

export default AppMenu;
