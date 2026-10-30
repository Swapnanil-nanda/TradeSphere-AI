package com.tradesphere.modules.watchlist.entity;

import com.tradesphere.modules.auth.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "watchlists", uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_watchlist_name", columnNames = {"user_id", "name"})
})
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "is_default", nullable = false)
    private boolean defaultList = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "watchlist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WatchlistItem> items = new ArrayList<>();

    public Watchlist() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isDefaultList() { return defaultList; }
    public void setDefaultList(boolean defaultList) { this.defaultList = defaultList; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<WatchlistItem> getItems() { return items; }
    public void setItems(List<WatchlistItem> items) { this.items = items; }
}
