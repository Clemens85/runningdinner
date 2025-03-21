
package org.runningdinner.core;

import com.google.common.base.MoreObjects;
import jakarta.persistence.*;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.hibernate.annotations.UuidGenerator;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base class for all JPA entity classes.
 * 
 * @author Clemens Stich
 * 
 */
@SuppressWarnings("serial")
@MappedSuperclass
@Access(AccessType.FIELD)
public abstract class AbstractEntity implements Serializable, Identifiable {

  /**
   * Primary Key identifier
   */
  @Id
  @GeneratedValue
  @UuidGenerator
  protected UUID id;

  /**
   * Natural business key which is also used from the "outside" for identifying entities
   */
  @Column(nullable = false, unique = true)
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

  @Override
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

  @Override
	public boolean isNew() {

    return id == null;
  }
  
  @Override
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
    if (!(obj instanceof AbstractEntity entity)) { // Needed for hibernate because of proxying
      return false;
    }

    return new EqualsBuilder().append(objectId, entity.objectId).isEquals();
  }

  @Override
  public String toString() {

    return MoreObjects.toStringHelper(this).addValue(id).toString();
  }
  
  
}
