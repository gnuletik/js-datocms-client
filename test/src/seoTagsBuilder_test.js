import EntitiesRepo from '../../src/local/EntitiesRepo';
import ItemsRepo from '../../src/local/ItemsRepo';
import seoTagsBuilder, { builders } from '../../src/utils/seoTagsBuilder';
import { camelizeKeys } from 'humps';
import i18n from '../../src/utils/i18n';

describe('seoTagsBuilder', () => {
  let itemTitle, titleSuffix, seo, globalSeo, itemsRepo, item, site, noIndex, itemImage;

  beforeEach(() => {
    itemTitle = memo(() => null);
    titleSuffix = memo(() => null);
    globalSeo = memo(() => null);
    seo = memo(() => null);
    noIndex = memo(() => null);
    itemImage = memo(() => null);

    itemsRepo = memo(() => {
      const payload = camelizeKeys({
        data: [
          {
            "id": "24038",
            "type": "item",
            "attributes": {
              "updated_at": "2016-12-07T09:14:22Z",
              "is_valid": true,
              "title": itemTitle(),
              "another_string": "Foo bar",
              "seo_settings": seo(),
              "image": itemImage()
            },
            "relationships": {
              "item_type": {
                "data": {
                  "id": "3781",
                  "type": "item_type"
                }
              }
            }
          },
          {
            "id": "681",
            "type": "site",
            "attributes": {
              "name": "XXX",
              "locales": [
                "en"
              ],
              "theme_hue": 190,
              "domain": null,
              "internal_domain": "wispy-sun-3056.admin.datocms.com",
              "global_seo": globalSeo(),
              "favicon": null,
              "no_index": noIndex(),
              "ssg": null
            },
            "relationships": {
              "menu_items": {
                "data": [
                  {
                    "id": "4212",
                    "type": "menu_item"
                  }
                ]
              },
              "item_types": {
                "data": [
                  {
                    "id": "3781",
                    "type": "item_type"
                  }
                ]
              }
            }
          },
          {
            "id": "3781",
            "type": "item_type",
            "attributes": {
              "name": "Article",
              "singleton": false,
              "sortable": false,
              "api_key": "article"
            },
            "relationships": {
              "fields": {
                "data": [
                  {
                    "id": "15088",
                    "type": "field"
                  },
                  {
                    "id": "15085",
                    "type": "field"
                  },
                  {
                    "id": "15086",
                    "type": "field"
                  },
                  {
                    "id": "15087",
                    "type": "field"
                  }
                ]
              },
              "singleton_item": {
                "data": null
              }
            }
          },
          {
            "id": "15088",
            "type": "field",
            "attributes": {
              "label": "Image",
              "field_type": "image",
              "api_key": "image",
              "hint": null,
              "localized": false,
              "validators": {},
              "position": 1,
              "appeareance": {}
            },
            "relationships": {
              "item_type": {
                "data": {
                  "id": "3781",
                  "type": "item_type"
                }
              }
            }
          },
          {
            "id": "15085",
            "type": "field",
            "attributes": {
              "label": "Title",
              "field_type": "string",
              "api_key": "title",
              "hint": null,
              "localized": false,
              "validators": {
                "required": {}
              },
              "position": 2,
              "appeareance": {
                "type": "title"
              }
            },
            "relationships": {
              "item_type": {
                "data": {
                  "id": "3781",
                  "type": "item_type"
                }
              }
            }
          },
          {
            "id": "15086",
            "type": "field",
            "attributes": {
              "label": "Another string",
              "field_type": "string",
              "api_key": "another_string",
              "hint": null,
              "localized": false,
              "validators": {},
              "position": 3,
              "appeareance": {
                "type": "plain"
              }
            },
            "relationships": {
              "item_type": {
                "data": {
                  "id": "3781",
                  "type": "item_type"
                }
              }
            }
          },
          {
            "id": "15087",
            "type": "field",
            "attributes": {
              "label": "SEO settings",
              "field_type": "seo",
              "api_key": "seo_settings",
              "hint": null,
              "localized": false,
              "validators": {},
              "position": 4,
              "appeareance": {}
            },
            "relationships": {
              "item_type": {
                "data": {
                  "id": "3781",
                  "type": "item_type"
                }
              }
            }
          }
        ]
      });

      const entitiesRepo = new EntitiesRepo(payload);
      return new ItemsRepo(entitiesRepo);
    });

    item = memo(() => null);
    site = memo(() => itemsRepo().site);
  });

  describe('description()', () => {
    let result, descriptionValue, ogValue, cardValue;

    beforeEach(() => {
      result = memo(() => builders.description(item(), site()));
      descriptionValue = memo(() => result()[0].attributes.content);
      ogValue = memo(() => result()[1].attributes.content);
      cardValue = memo(() => result()[2].attributes.content);
    });

    context('with no fallback seo', () => {
      context('with no item', () => {
        it('returns no tags', () => {
          expect(result()).to.be.undefined();
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => itemsRepo().articles[0]);
        });

        context('no SEO', () => {
          it('returns no tags', () => {
            expect(result()).to.be.undefined();
          });
        });

        context('with SEO', () => {
          beforeEach(() => {
            seo = memo(() => camelizeKeys({
              "description": "SEO description",
            }));
          });

          it('returns seo description', () => {
            expect(descriptionValue()).to.eq("SEO description");
            expect(ogValue()).to.eq("SEO description");
            expect(cardValue()).to.eq("SEO description");
          });
        });
      });
    });

    context('with fallback seo', () => {
      beforeEach(() => {
        globalSeo = memo(() => camelizeKeys({
          "fallback_seo": {
            "description": "Default description"
          }
        }));
      });

      context('with no item', () => {
        it('returns fallback description', () => {
          expect(descriptionValue()).to.eq("Default description");
          expect(ogValue()).to.eq("Default description");
          expect(cardValue()).to.eq("Default description");
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => itemsRepo().articles[0]);
        });

        context('no SEO', () => {
          it('returns fallback description', () => {
            expect(descriptionValue()).to.eq("Default description");
            expect(ogValue()).to.eq("Default description");
            expect(cardValue()).to.eq("Default description");
          });
        });

        context('with SEO', () => {
          beforeEach(() => {
            seo = memo(() => camelizeKeys({
              "description": "SEO description",
            }));
          });

          it('returns seo description', () => {
            expect(descriptionValue()).to.eq("SEO description");
            expect(ogValue()).to.eq("SEO description");
            expect(cardValue()).to.eq("SEO description");
          });
        });
      });
    });
  });

  describe('robots()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.robots(null, site()));
    });

    context('with site noIndex set', () => {
      beforeEach(() => {
        noIndex = memo(() => true);
      });

      it('returns robots meta tag', () => {
        expect(result().attributes.content).to.eq("noindex");
      });
    });

    context('with site noIndex not set', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });
  });

  describe('twitterSite()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.twitterSite(null, site()));
    });

    context('with twitter account not set', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });

    context('with twitter account set', () => {
      beforeEach(() => {
        globalSeo = memo(() => camelizeKeys({
          "twitter_account": "@steffoz"
        }));
      });

      it('returns robots meta tag', () => {
        expect(result().attributes.content).to.eq("@steffoz");
      });
    });
  });

  describe('articleModifiedTime()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.articleModifiedTime(item(), site()));
    });

    context('with no item', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });

    context('with item', () => {
      beforeEach(() => {
        item = memo(() => itemsRepo().articles[0]);
      });

      it('returns iso 8601 datetime', () => {
        expect(result().attributes.content).to.eq("2016-12-07T09:14:22Z");
      });
    });
  });

  describe('articlePublisher()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.articlePublisher(null, site()));
    });

    context('with FB page not set', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });

    context('with FB page set', () => {
      beforeEach(() => {
        globalSeo = memo(() => camelizeKeys({
          "facebook_page_url": "http://facebook.com/mark.smith"
        }));
      });

      it('returns robots meta tag', () => {
        expect(result().attributes.content).to.eq("http://facebook.com/mark.smith");
      });
    });
  });

  describe('ogLocale()', () => {
    it('returns current i18n locale', () => {
      const result = i18n.withLocale('en', () => builders.ogLocale(null, null));
      expect(result.attributes.content).to.eq('en_EN');
    });
  });

  describe('ogType()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.ogType(item(), site()));
    });

    context('with no item', () => {
      it('returns website og:type', () => {
        expect(result().attributes.content).to.eq('website');
      });
    });

    context('with item', () => {
      beforeEach(() => {
        item = memo(() => itemsRepo().articles[0]);
      });

      it('returns article og:type', () => {
        expect(result().attributes.content).to.eq('article');
      });
    });
  });

  describe('ogSiteName()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.ogSiteName(null, site()));
    });

    context('with site name not set', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });

    context('with site name set', () => {
      beforeEach(() => {
        globalSeo = memo(() => camelizeKeys({
          "site_name": "My site"
        }));
      });

      it('returns og:site_name tag', () => {
        expect(result().attributes.content).to.eq("My site");
      });
    });
  });

  describe('image()', () => {
    let result, ogValue, cardValue;

    beforeEach(() => {
      ogValue = memo(() => result()[0].attributes.content);
      cardValue = memo(() => result()[1].attributes.content);
      result = memo(() => builders.image(item(), site()));
    });

    context('with no fallback seo', () => {
      context('with no item', () => {
        it('returns no tags', () => {
          expect(result()).to.be.undefined();
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => itemsRepo().articles[0]);
        });

        context('with no image', () => {
          context('no SEO', () => {
            it('returns no tags', () => {
              expect(result()).to.be.undefined();
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() => camelizeKeys({
                "image": {
                  "path": "/seo.png",
                  "width": 569,
                  "height": 629,
                  "format": "png",
                  "size": 572451
                }
              }));
            });

            it('returns seo image', () => {
              expect(ogValue()).to.include("seo.png");
              expect(cardValue()).to.include("seo.png");
            });
          });
        });

        context('with image', () => {
          beforeEach(() => {
            itemImage = memo(() => camelizeKeys({
              "path": "/image.png",
              "width": 569,
              "height": 629,
              "format": "png",
              "size": 572451
            }));
          });

          context('no SEO', () => {
            it('returns item image', () => {
              expect(ogValue()).to.include("image.png");
              expect(cardValue()).to.include("image.png");
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() => camelizeKeys({
                "image": {
                  "path": "/seo.png",
                  "width": 569,
                  "height": 629,
                  "format": "png",
                  "size": 572451
                }
              }));
            });

            it('returns SEO image', () => {
              expect(ogValue()).to.include("seo.png");
              expect(cardValue()).to.include("seo.png");
            });
          });
        });
      });
    });

    context('with fallback seo', () => {
      beforeEach(() => {
        globalSeo = memo(() => camelizeKeys({
          "fallback_seo": {
            "image": {
              "path": "/fallback.png",
              "width": 569,
              "height": 629,
              "format": "png",
              "size": 572451
            }
          }
        }));
      });

      context('with no item', () => {
        it('returns fallback image', () => {
          expect(ogValue()).to.include("fallback.png");
          expect(cardValue()).to.include("fallback.png");
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => itemsRepo().articles[0]);
        });

        context('with no image', () => {
          context('no SEO', () => {
            it('returns fallback image', () => {
              expect(ogValue()).to.include("fallback.png");
              expect(cardValue()).to.include("fallback.png");
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() => camelizeKeys({
                "image": {
                  "path": "/seo.png",
                  "width": 569,
                  "height": 629,
                  "format": "png",
                  "size": 572451
                }
              }));
            });

            it('returns seo image', () => {
              expect(ogValue()).to.include("seo.png");
              expect(cardValue()).to.include("seo.png");
            });
          });
        });

        context('with image', () => {
          beforeEach(() => {
            itemImage = memo(() => camelizeKeys({
              "path": "/image.png",
              "width": 569,
              "height": 629,
              "format": "png",
              "size": 572451
            }));
          });

          context('no SEO', () => {
            it('returns item image', () => {
              expect(ogValue()).to.include("image.png");
              expect(cardValue()).to.include("image.png");
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() => camelizeKeys({
                "image": {
                  "path": "/seo.png",
                  "width": 569,
                  "height": 629,
                  "format": "png",
                  "size": 572451
                }
              }));
            });

            it('returns SEO image', () => {
              expect(ogValue()).to.include("seo.png");
              expect(cardValue()).to.include("seo.png");
            });
          });
        });
      });
    });
  });
});
