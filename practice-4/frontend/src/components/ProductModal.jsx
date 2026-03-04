import { useEffect, useState } from "react";

const ProductModal = ({ open, mode, initialProduct, onClose, onSubmit }) => {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [rating, setRating] = useState("");

    useEffect(() => {
        if (!open) return;

        setName(initialProduct?.name ?? "");
        setCategory(initialProduct?.category ?? "");
        setDescription(initialProduct?.description ?? "");
        setPrice(initialProduct?.price != null ? String(initialProduct.price) : "");
        setStock(initialProduct?.stock != null ? String(initialProduct.stock) : "");
        setImageUrl(initialProduct?.imageUrl ?? "");
        setRating(initialProduct?.rating != null ? String(initialProduct.rating) : "");
    }, [open, initialProduct]);

    if (!open) return null;

    const title = mode === "edit" ? "✏️ Редактирование автомобиля" : "➕ Добавление автомобиля";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const parsedPrice = Number(price);
        const parsedStock = Number(stock);
        const parsedRating = rating ? Number(rating) : null;

        if (!trimmedName) {
            alert("Введите название автомобиля");
            return;
        }
        if (!trimmedCategory) {
            alert("Введите категорию автомобиля");
            return;
        }
        if (!trimmedDescription) {
            alert("Введите описание автомобиля");
            return;
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            alert("Введите корректную цену (положительное число)");
            return;
        }
        if (!Number.isFinite(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
            alert("Введите корректное количество (целое положительное число)");
            return;
        }
        if (parsedRating && (parsedRating < 1 || parsedRating > 5)) {
            alert("Рейтинг должен быть от 1 до 5");
            return;
        }

        onSubmit({
            id: initialProduct?.id,
            name: trimmedName,
            category: trimmedCategory,
            description: trimmedDescription,
            price: parsedPrice,
            stock: parsedStock,
            ...(imageUrl && { imageUrl }),
            ...(parsedRating && { rating: parsedRating }),
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
            >
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose}>✕</button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название автомобиля *
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ferrari F8 Tributo"
                            autoFocus
                            required
                        />
                    </label>

                    <label className="label">
                        Категория *
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Суперкар"
                            required
                        />
                    </label>

                    <label className="label">
                        Описание *
                        <textarea
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="3.9-литровый V8 твин-турбо, 720 л.с., разгон до 100 км/ч за 2.9 секунды"
                            rows="3"
                            required
                        />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <label className="label">
                            Цена ($) *
                            <input
                                className="input"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="275000"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </label>

                        <label className="label">
                            Количество на складе *
                            <input
                                className="input"
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="3"
                                min="0"
                                step="1"
                                required
                            />
                        </label>
                    </div>

                    <label className="label">
                        Ссылка на фото (необязательно)
                        <input
                            className="input"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/ferrari.jpg"
                        />
                    </label>

                    <label className="label">
                        Рейтинг (1-5, необязательно)
                        <input
                            className="input"
                            type="number"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            placeholder="4.8"
                            min="1"
                            max="5"
                            step="0.1"
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Добавить"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;