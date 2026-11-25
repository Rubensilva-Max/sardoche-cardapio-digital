const WHATSAPP_NUMBER = "5584988002244";
const money = value => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

// Valores e descrições abaixo são apenas demonstrativos. Confirmar com o restaurante.
const products = [
  {id:1,name:"Camarões crocantes",category:"Frutos do mar",description:"Camarões empanados com acompanhamento de batatas fritas.",price:49.90,image:"assets/camaroes-destaque.png",tag:"Destaque"},
  {id:2,name:"Meca na brasa",category:"Frutos do mar",description:"Sugestão de prato com peixe grelhado e acompanhamentos.",price:59.90,tag:"Sugestão"},
  {id:3,name:"Peixe do dia",category:"Frutos do mar",description:"Preparação de peixe com acompanhamentos da casa.",price:44.90},
  {id:4,name:"Carne de sol",category:"Pratos",description:"Carne de sol com acompanhamentos tradicionais.",price:39.90},
  {id:5,name:"Frango grelhado",category:"Pratos",description:"Frango grelhado servido com acompanhamentos.",price:32.90},
  {id:6,name:"Churrasco",category:"Churrasco",description:"Seleção de carnes na brasa. Consulte as opções disponíveis.",price:45.90},
  {id:7,name:"Feijoada",category:"Pratos",description:"Clássico da cozinha brasileira com acompanhamentos.",price:34.90},
  {id:8,name:"Buffet",category:"Buffet",description:"Opções variadas de buffet. Consulte a disponibilidade do dia.",price:42.90},
  {id:9,name:"Salada da casa",category:"Acompanhamentos",description:"Seleção de folhas e acompanhamentos frescos.",price:18.90},
  {id:10,name:"Batatas fritas",category:"Acompanhamentos",description:"Porção de batatas fritas douradas.",price:16.90}
];
const categories = ["Todos","Frutos do mar","Pratos","Churrasco","Buffet","Acompanhamentos"];
let activeCategory = "Todos";
let cart = [];
const menuGrid = document.getElementById("menuGrid");
const categoryList = document.getElementById("categoryList");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const toast = document.getElementById("toast");

function renderCategories(){
  categoryList.innerHTML = categories.map(category => `<button class="category-chip ${activeCategory===category?"active":""}" data-category="${category}">${category}</button>`).join("");
}
function renderProducts(){
  const query = document.getElementById("searchInput").value.trim().toLocaleLowerCase("pt-BR");
  const filtered = products.filter(p => (activeCategory==="Todos" || p.category===activeCategory) && `${p.name} ${p.description} ${p.category}`.toLocaleLowerCase("pt-BR").includes(query));
  menuGrid.innerHTML = filtered.map(p => `<article class="menu-card">
    <div class="menu-photo">${p.image?`<img src="${p.image}" alt="${p.name}" loading="lazy">`:`<div class="photo-placeholder">${p.category}</div>`}</div>
    <div class="menu-card-body"><div class="menu-card-top"><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div>
    <p>${p.description}</p><button class="add-button" data-add="${p.id}"><span>＋</span> Adicionar ao pedido</button></div>
  </article>`).join("");
  if(!filtered.length) menuGrid.innerHTML = `<p class="no-results">Nenhum item encontrado. Tente outra busca.</p>`;
}
function addToCart(id){
  const item = cart.find(i=>i.id===id);
  if(item) item.quantity++; else cart.push({id,quantity:1});
  renderCart(); showToast("Item adicionado ao seu pedido.");
}
function changeQuantity(id,delta){
  const item=cart.find(i=>i.id===id); if(!item)return;
  item.quantity+=delta; if(item.quantity<=0)cart=cart.filter(i=>i.id!==id);
  renderCart();
}
function removeItem(id){cart=cart.filter(i=>i.id!==id);renderCart();}
function total(){return cart.reduce((sum,line)=>sum+products.find(p=>p.id===line.id).price*line.quantity,0);}
function renderCart(){
  const count=cart.reduce((sum,i)=>sum+i.quantity,0);
  document.getElementById("cartCount").textContent=count;
  document.getElementById("cartTotal").textContent=money(total());
  document.getElementById("modalTotal").textContent=money(total());
  document.getElementById("checkoutButton").disabled=count===0;
  if(!count){
    document.getElementById("cartItems").innerHTML=`<div class="empty-cart"><span>＋</span><h3>Seu carrinho está vazio</h3><p>Adicione seus pratos favoritos para começar.</p><button class="text-link" id="browseMenu">Explorar cardápio →</button></div>`;
    return;
  }
  document.getElementById("cartItems").innerHTML=cart.map(line=>{
    const p=products.find(item=>item.id===line.id);
    return `<div class="cart-line"><div><h4>${p.name}</h4><small>${money(p.price)} cada</small><div class="quantity-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Diminuir">−</button><span>${line.quantity}</span><button data-qty="${p.id}" data-delta="1" aria-label="Aumentar">＋</button></div><button class="remove-line" data-remove="${p.id}">Remover</button></div><span class="cart-line-price">${money(p.price*line.quantity)}</span></div>`;
  }).join("");
}
function openCart(){cartDrawer.classList.add("open");cartOverlay.classList.add("show");cartDrawer.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeCart(){cartDrawer.classList.remove("open");cartOverlay.classList.remove("show");cartDrawer.setAttribute("aria-hidden","true");document.body.style.overflow="";}
function showToast(message){toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);}
function openCheckout(){
  if(!cart.length)return;
  closeCart();document.getElementById("checkoutModal").classList.add("show");document.body.style.overflow="hidden";
}
function closeCheckout(){document.getElementById("checkoutModal").classList.remove("show");document.body.style.overflow="";}
function buildOrderMessage(form){
  const data=new FormData(form);
  const lines=cart.map(line=>{const p=products.find(item=>item.id===line.id);return `• ${line.quantity}x ${p.name} — ${money(p.price*line.quantity)}`;});
  const service=data.get("service");
  return [
    "Olá, Sadoche! Gostaria de confirmar este pedido:",
    "",
    ...lines,
    "",
    `*Total demonstrativo: ${money(total())}*`,
    `Nome: ${data.get("customer")}`,
    `Recebimento: ${service}`,
    service.startsWith("Entrega") && data.get("address") ? `Endereço: ${data.get("address")}` : "",
    data.get("notes") ? `Observações: ${data.get("notes")}` : "",
    "",
    "Sei que os valores e a disponibilidade precisam ser confirmados pelo restaurante."
  ].filter(Boolean).join("\n");
}

categoryList.addEventListener("click",e=>{
  const button=e.target.closest("[data-category]");if(!button)return;
  activeCategory=button.dataset.category;renderCategories();renderProducts();
});
menuGrid.addEventListener("click",e=>{const button=e.target.closest("[data-add]");if(button)addToCart(Number(button.dataset.add));});
document.getElementById("searchInput").addEventListener("input",renderProducts);
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
cartOverlay.addEventListener("click",closeCart);
document.getElementById("cartItems").addEventListener("click",e=>{
  const qty=e.target.closest("[data-qty]");const remove=e.target.closest("[data-remove]");
  if(qty)changeQuantity(Number(qty.dataset.qty),Number(qty.dataset.delta));
  if(remove)removeItem(Number(remove.dataset.remove));
  if(e.target.closest("#browseMenu")){closeCart();document.getElementById("cardapio").scrollIntoView({behavior:"smooth"});}
});
document.getElementById("checkoutButton").addEventListener("click",openCheckout);
document.getElementById("closeCheckout").addEventListener("click",closeCheckout);
document.getElementById("checkoutModal").addEventListener("click",e=>{if(e.target.id==="checkoutModal")closeCheckout();});
document.getElementById("serviceType").addEventListener("change",e=>{
  const isDelivery=e.target.value.startsWith("Entrega");
  document.getElementById("addressField").classList.toggle("hidden",!isDelivery);
  document.querySelector('[name="address"]').required=isDelivery;
});
document.getElementById("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!cart.length)return;
  const message=buildOrderMessage(e.currentTarget);
  const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url,"_blank","noopener,noreferrer");
});
document.querySelector(".notice-close").addEventListener("click",()=>document.querySelector(".demo-notice").remove());
document.getElementById("year").textContent=new Date().getFullYear();
renderCategories();renderProducts();renderCart();
