import ProductItem from "./ProductItem.jsx";

const ProductsList = ({ products, onEdit, onDelete }) => {
    if (!products.length) {
        return (
            <div className="empty">
                🛒 В магазине пока нет товаров
            </div>
        );
    }

    return (
        <div className="list">
            {products.map((product) => (
                <ProductItem
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default ProductsList;