import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

import { CategoryInterface } from "../interfaces/category";
import apiClient from "../config/axiosClient";
import { ProductInterface } from "../interfaces/product";
import { UserDto } from "../interfaces/user";
import { useToast } from "@chakra-ui/react";
interface MyContextType {
  categories: CategoryInterface[] | null;
  setCategories: Dispatch<SetStateAction<CategoryInterface[] | null>>;

  setActualCategory: (categoryToUpdate: CategoryInterface) => void;
  actualCategory: CategoryInterface | undefined;
  handleClickCategory: (id: number) => void;
  styleCss: { principal: string };
  carrito: ProductInterface[] | null;
  setCarrito: Dispatch<SetStateAction<ProductInterface[] | []>>;
  handleAddToCarrito: (product: ProductInterface) => void;
  isOpenModal: boolean;
  setIsOpenModal: Dispatch<SetStateAction<boolean>>;
  pay: (payment: string, customerId: number) => void;
  user: UserDto | null;
  setUser: Dispatch<SetStateAction<UserDto | null>>;
  handleEditProductOfCarrito: (id: number, newQuantity: number) => void;
  handleRemoveProductFromCarrito: (id: number) => void;
  featureAdmin: CategoryInterface | undefined;
  handleClickCategoryAdmin: (id: number) => void;
  categoriesAdmin: CategoryInterface[];
  setChangeCategory: Dispatch<SetStateAction<boolean>>;
  changeCategory: boolean;
  totalCarrito: () => number;
}

export const AppContext = createContext<MyContextType>({} as MyContextType);

type AppContextProviderProps = {
  children: ReactNode;
};

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const [categories, setCategories] = useState<CategoryInterface[] | null>([]);
  const [carrito, setCarrito] = useState<ProductInterface[] | []>([]);
  const [actualCategory, setActualCategory] = useState<
    CategoryInterface | undefined
  >({
    id: 0,
    img: "",
    name: "",
  });
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [user, setUser] = useState<UserDto | null>(null);
  const [featureAdmin, setFeatureAdmin] = useState<
    CategoryInterface | undefined
  >({
    id: 1,
    img: "https://res.cloudinary.com/dacgvqpeg/image/upload/v1688648111/3309960_synkq9.png",
    name: "Estadistics",
  });
  const toast = useToast();
  const [changeCategory, setChangeCategory] = useState(false);
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/category");
      if (response.data.ok) {
        const newCategories = response.data.body;
        setCategories(newCategories);
        setActualCategory(newCategories[0]);
      } else {
        throw new Error("Error fetch categories");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [changeCategory]);

  const handleClickCategory = (id: number) => {
    const category = categories?.filter((category) => category.id == id)[0];
    setActualCategory(category);
  };

  const handleAddToCarrito = (product: ProductInterface) => {
    if (carrito.some((carritoState) => carritoState.id == product.id)) {
      const carritoActualizado = carrito.map((carritoState) =>
        carritoState.id == product.id ? product : carritoState
      );
      setCarrito(carritoActualizado);
      toast({
        title: `Changes saved successfuly`,
        status: "success",
        duration: 2000,
        position: "top-left",
        isClosable: true,
      });
    } else {
      setCarrito([...carrito, product]);
      toast({
        title: `${product.name} Added to Shopping Cart`,
        description: "Added succesfully",
        status: "success",
        duration: 2000,
        position: "top-left",
        isClosable: true,
      });
    }
  };

  const totalCarrito = () => {
    if (carrito)
      return carrito.reduce(
        (acc, product: ProductInterface) =>
          acc + product.price * (product.quantity ? product.quantity : 1),
        0
      );
    return 0;
  };

  const handleEditProductOfCarrito = (id: number, newQuantity: number) => {
    const product = carrito.find((product) => product.id == id);
    if (product) product.quantity = newQuantity;
  };

  const handleRemoveProductFromCarrito = (id: number) => {
    setCarrito(carrito.filter((product) => product.id != id));
    toast({
      title: `removed from Shopping Cart`,
      description: "Removed succesfully",
      status: "warning",
      duration: 2000,
      position: "top-left",
      isClosable: true,
    });
  };

  const pay = async (payment: string, customerId: number) => {
    if (user && carrito.length > 0) {
      try {
        const response = await apiClient.post("/purchase", {
          state: "pendiente",
          payment,
          customer: customerId,
        });
        if (response.data.ok) {
          if(payment == "MP"){
            const response = await apiClient.post("/create-order-mp", {carrito});
            window.location.replace(response.data.body.urlMercadoPago);
          }
          Promise.all(
            carrito.map((product) => {
              return apiClient.post("/purchasesProducts", {
                quantity: product.quantity,
                purchase: response.data.body.id,
                product: product.id,
              });
            })
          )
            .then(() => {
              setCarrito([]);
              toast({
                title: "Purchase success",
                description: "Enjoy your purchase",
                status: "success",
                duration: 2000,
                isClosable: true,
              });
              setIsOpenModal(false);
              return;
            })
            .catch(() => {
              throw new Error("err");
            });
        } else {
          throw new Error("err");
        }
      } catch (error) {
        toast({
          title: "Error from server",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        return;
      }
    } else {
      toast({
        title: "Log in to buy",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const categoriesAdmin: CategoryInterface[] = [
    {
      id: 1,
      img: "https://res.cloudinary.com/dacgvqpeg/image/upload/v1688648111/3309960_synkq9.png",
      name: "Stadistics",
    },
    {
      id: 2,
      img: "https://res.cloudinary.com/dacgvqpeg/image/upload/v1688004054/mouse-gamer-logitech-g-pro-gaming-con-cable-luz-led-rgb-12000-dpi_qobn5p.jpg",
      name: "Products",
    },
    {
      id: 3,
      img: "https://res.cloudinary.com/dacgvqpeg/image/upload/v1688648259/images_ffrrid.jpg",
      name: "Categories",
    },
    {
      id: 4,
      img: "https://res.cloudinary.com/dacgvqpeg/image/upload/v1688648341/images_vs2byy.png",
      name: "Purchases",
    },
  ];

  const handleClickCategoryAdmin = (id: number) => {
    const category = categoriesAdmin?.filter(
      (category) => category.id == id
    )[0];
    setFeatureAdmin(category);
  };

  const styleCss = {
    principal: "#FFC200",
  };

  const contextValue: MyContextType = {
    categories,
    setCategories,
    actualCategory,
    setActualCategory,
    handleClickCategory,
    styleCss,
    carrito,
    setCarrito,
    handleAddToCarrito,
    isOpenModal,
    setIsOpenModal,
    pay,
    setUser,
    user,
    handleEditProductOfCarrito,
    handleRemoveProductFromCarrito,
    featureAdmin,
    categoriesAdmin,
    handleClickCategoryAdmin,
    setChangeCategory,
    changeCategory,
    totalCarrito
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
