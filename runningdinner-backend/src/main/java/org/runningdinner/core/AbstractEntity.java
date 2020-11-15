
package org.runningdinner.core;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Version;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import com.google.common.base.MoreObjects;

/**
 * Base class for all JPA entity classes.
 * 
 * @author Clemens Stich
 * 
 */
@SuppressWarnings("serial")
@MappedSuperclass
@Access(AccessType.FIELD)
public abstract class AbstractEntity implements Serializable {

  /**
   * Primary Key identifier
   */
  @Id
  @GeneratedValue(generator = "rfc4122-uuid")
  @GenericGenerator(name = "rfc4122-uuid", strategy = "uuid2")
  @Type(type = "pg-uuid")
  protected UUID id;

  /**
   * Natural business key which is also used from the "outside" for identifying entities
   */
  @Column(nullable = false, unique = true)
  @Type(type = "pg-uuid")
  protected UUID objectId;

  /**
   * Used for optimistic locking
   */
  @Version
  @Column(nullable = false)
  protected long lockVersion;

  /**
   * Column when entity is created (currently not filled in)
   */
  @Column(nullable = false, columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  protected LocalDateTime createdAt;

  /**
   * Column when entity is modified (currently not filled in)
   */
  @Column(nullable = false, columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  protected LocalDateTime modifiedAt;

  public AbstractEntity() {
    
    setObjectId(UUID.randomUUID());
  }

  public UUID getId() {

    return id;
  }

  protected void setId(UUID id) {

    this.id = id;
  }

  protected long getLockVersion() {

    return lockVersion;
  }

  protected void setLockVersion(long versionNo) {

    this.lockVersion = versionNo;
  }

  public LocalDateTime getCreatedAt() {

    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {

    this.createdAt = createdAt;
  }

  public LocalDateTime getModifiedAt() {

    return modifiedAt;
  }

  public void setModifiedAt(LocalDateTime modifiedAt) {

    this.modifiedAt = modifiedAt;
  }

  public boolean isNew() {

    return id == null;
  }
  
  public boolean isSameId(UUID id) {
    
    return this.id.equals(id);
  }

  /**
   * Returns a string (business key) that uniquely identifies this entity independently of its persistence state
   * 
   * @return
   */
  public UUID getObjectId() {

    return objectId;
  }

  /**
   * Track modification date on every change
   */
  @PreUpdate
  protected void onUpdate() {

    setModifiedAt(LocalDateTime.now());
  }

  @PrePersist
  protected void onCreate() {

    LocalDateTime now = LocalDateTime.now();
    setCreatedAt(now);
    setModifiedAt(now);
  }

  protected void setObjectId(UUID objectId) {

    this.objectId = objectId;
  }

  @Override
  public int hashCode() {

    return new HashCodeBuilder(31, 7).append(objectId).hashCode();
  }

  @Override
  public boolean equals(Object obj) {

    if (obj == null) {
      return false;
    }
    if (obj == this) {
      return true;
    }
    if (!(obj instanceof AbstractEntity)) { // Needed for hibernate because of proxying
      return false;
    }

    AbstractEntity entity = (AbstractEntity) obj;
    return new EqualsBuilder().append(objectId, entity.objectId).isEquals();
  }
  
  public static <T extends AbstractEntity> T filterListForId(List<T> entityList, UUID entityId) {
    
    return entityList
            .stream()
            .filter(e -> Objects.equals(entityId, e.getId()))
            .findAny()
            .orElseThrow(() -> new IllegalStateException("Expected " + entityList + " to contain requested " + entityId));
  }

  @Override
  public String toString() {

    return MoreObjects.toStringHelper(this).addValue(id).toString();
  }
  
  
}
