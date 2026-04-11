import { useState, useEffect } from "react";
import "../styles/ProductsPage.scss";
import ProductsList from "./ProductsList.jsx";
import ProductModal from "./ProductModal.jsx";
import { api } from "../api";

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getCars();
            setProducts(data);
        } catch (err) {
            console.error("Ошибка загрузки:", err);
            setError("Не удалось загрузить товары. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setModalMode("create");
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEditModal = (product) => {
        setModalMode("edit");
        setEditingProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("🗑️ Удалить этот товар?");
        if (!ok) return;

        try {
            await api.deleteCar(id);  // ← ИСПРАВЛЕНО: deleteProduct → deleteCar
            setProducts((prev) => prev.filter((p) => p.id !== id));
            alert("✅ Товар удален");
        } catch (err) {
            console.error("Ошибка удаления:", err);
            alert("❌ Не удалось удалить товар");
        }
    };

    const handleSubmitModal = async (productData) => {
        try {
            if (modalMode === "create") {
                const newProduct = await api.createCar(productData);  // ← ИСПРАВЛЕНО: createProduct → createCar
                setProducts((prev) => [...prev, newProduct]);
                alert("✅ Товар создан");
            } else {
                const updatedProduct = await api.updateCar(productData.id, productData);  // ← ИСПРАВЛЕНО: updateProduct → updateCar
                setProducts((prev) =>
                    prev.map((p) => (p.id === productData.id ? updatedProduct : p))
                );
                alert("✅ Товар обновлен");
            }
            closeModal();
        } catch (err) {
            console.error("Ошибка сохранения:", err);
            alert("❌ Не удалось сохранить товар");
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">⚪🔴🟡 Автосалон "Иристон"</div>  {/* Можешь поменять название */}
                    <div className="header__right">Онлайн-автосалон</div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Автомобили</h1>  {/* Товары → Автомобили */}
                        <button className="btn btn--primary" onClick={openCreateModal}>
                            ➕ Добавить автомобиль
                        </button>
                    </div>

                    {loading && (
                        <div className="loading">
                            ⏳ Загрузка автомобилей...
                        </div>
                    )}

                    {error && (
                        <div className="error">
                            ❌ {error}
                            <button onClick={loadProducts} className="btn">
                                Повторить
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <ProductsList
                            products={products}  // здесь products - это массив машин с бэкенда
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    © {new Date().getFullYear()} Автосалон "Владикавказ". Все права защищены.
                </div>
            </footer>

            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={editingProduct}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
            />
        </div>
    );
}

export default ProductsPage;