package com.tradesphere.modules.instrument.dto;

import java.math.BigDecimal;
import java.util.List;

public class DomDepthDto {
    private String symbol;
    private BigDecimal ltp;
    private BigDecimal spread;
    private List<OrderBookLevel> bids;
    private List<OrderBookLevel> asks;

    public DomDepthDto() {}

    public static class OrderBookLevel {
        private BigDecimal price;
        private int quantity;
        private int orders;

        public OrderBookLevel() {}

        public OrderBookLevel(BigDecimal price, int quantity, int orders) {
            this.price = price;
            this.quantity = quantity;
            this.orders = orders;
        }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public int getOrders() { return orders; }
        public void setOrders(int orders) { this.orders = orders; }
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public BigDecimal getLtp() { return ltp; }
    public void setLtp(BigDecimal ltp) { this.ltp = ltp; }
    public BigDecimal getSpread() { return spread; }
    public void setSpread(BigDecimal spread) { this.spread = spread; }
    public List<OrderBookLevel> getBids() { return bids; }
    public void setBids(List<OrderBookLevel> bids) { this.bids = bids; }
    public List<OrderBookLevel> getAsks() { return asks; }
    public void setAsks(List<OrderBookLevel> asks) { this.asks = asks; }
}
