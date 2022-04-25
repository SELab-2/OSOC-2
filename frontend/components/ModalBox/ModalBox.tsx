export const ModalBox: React.FC = () => {
    return (
        <>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css"
            ></link>
            <div className="modal">
                <div className="modal-background"></div>
                <div className="modal-content">
                    <p>Dit is een test</p>
                </div>
                <button
                    className="modal-close is-large"
                    aria-label="close"
                ></button>
            </div>
        </>
    );
};
