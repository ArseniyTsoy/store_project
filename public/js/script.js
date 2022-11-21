let navbar = document.querySelector('.header .flex .navbar');

document.querySelector('#menu-btn').onclick = () =>{
  navbar.classList.toggle('active');
  profile.classList.remove('active');
}

let profile = document.querySelector('.header .flex .profile');

document.querySelector('#user-btn').onclick = () =>{
  profile.classList.toggle('active');
  navbar.classList.remove('active');
}

window.onscroll = () =>{
  profile.classList.remove('active');
  navbar.classList.remove('active');
}

// Add to cart
async function addToCart(btn) {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const qty = btn.parentNode.querySelector("[name=qty]").value;

  try {
    let result = await fetch("/user/cart-add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "csrf-token": csrf
      },
      body: JSON.stringify({
        productId: productId,
        qty: qty
      })
    });

    result = await result.json();

    if (result.alreadyIn) {
      return alert(`Товар уже в корзине. Количество было увеличено на ${qty} шт.`);
    }
    
    const cart = document.querySelector('#cart-count');
    
    cart.innerHTML = `(${result.itemsInCart})`;

    return cart.classList.add("activeCart");
  } catch(err) {
    throw new Error(err);
  }
};

// Add to wishlist
async function addToWishlist(btn) {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  try {
    let result = await fetch("/user/wishlist-add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "csrf-token": csrf
      },
      body: JSON.stringify({
        productId: productId
      })
    });

    result = await result.json();

    if (result.alreadyIn) {
      return alert("Товар уже в списке желаемого:)");
    }
    
    const wishlist = document.querySelector('#wishlist-count');
    
    wishlist.innerHTML = `(${result.itemsInWishlist})`;

    return wishlist.classList.add("activeList");
  } catch(err) {
    throw new Error(err);
  }
};