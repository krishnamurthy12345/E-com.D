import React from 'react';
import './Descriptionbox.css';
const DescriptionBox = () => {
    return (
        <div className='descriptionbox'>
            <div className='descriptionbox-navigator'>
                <div className='descriptionbox-nav-box'>Description</div>
                <div className='descriptionbox-nav-box fade'>Reviews (122)</div>
            </div>
            <div className='descriptionbox-description'>
                <p>What is an e-commerce platform?
                    An ecommerce platform is the content management system (CMS) and commerce engine websites use to manage catalogued products, register purchases and manage a users relationship with an online retailer. It doesn't matter if your business is large or small, B2B or B2C, selling tangible goods or providing remote services</p>
                <p>
                    An e-commerce website is a digital platform that facilitates online transactions between businesses and consumers. These websites typically include product catalogs, shopping carts, payment processing systems, and other features that allow customers to browse, select, and purchase products or services.
                </p>
            </div>
        </div>
    )
}

export default DescriptionBox